class RecurringTaskService
  MONTH_AHEAD = 1.month
  YEAR_AHEAD = 1.year

  def initialize(task)
    @task = task
  end

  # Generate all occurrences based on recurrence type
  def generate_month_ahead
    return if @task.one_time?

    dates = calculate_dates
    dates.each do |date|
      create_occurrence_for_date(date)
    end
  end

  # Regenerate series - delete future incomplete children and recreate
  def regenerate_series
    return if @task.one_time?

    # Delete future incomplete children
    @task.recurrence_children
         .where('scheduled_date > ?', Date.today)
         .where.not(status: :done)
         .destroy_all

    # Regenerate
    generate_month_ahead
  end

  # Create a single next occurrence (legacy method)
  def create_next_occurrence
    return nil if @task.one_time?

    next_date = calculate_next_date
    return nil if next_date.nil?
    return nil if occurrence_exists?(next_date)

    create_occurrence_for_date(next_date)
  end

  private

  def calculate_dates
    case @task.recurrence
    when "daily"
      calculate_daily_dates
    when "weekly"
      calculate_weekly_dates
    when "monthly"
      calculate_monthly_dates
    when "weekdays"
      calculate_weekday_dates
    when "weekends"
      calculate_weekend_dates
    else
      []
    end
  end

  def calculate_daily_dates
    # 1 month of daily tasks
    end_date = @task.scheduled_date + MONTH_AHEAD
    dates = []
    current_date = @task.scheduled_date

    while (current_date += 1.day) <= end_date
      dates << current_date
    end

    dates
  end

  def calculate_weekly_dates
    # 1 month of weekly tasks on selected days
    end_date = @task.scheduled_date + MONTH_AHEAD
    dates = []

    if @task.weekly_days.present? && @task.weekly_days.any?
      # Generate for each selected day for each week
      current_week_start = @task.scheduled_date.beginning_of_week
      while current_week_start <= end_date
        week_dates = dates_for_weekly_days(current_week_start)
        dates.concat(week_dates.select { |d| d > @task.scheduled_date && d <= end_date })
        current_week_start += 1.week
      end
    else
      # No specific days selected, repeat on same day of week
      current_date = @task.scheduled_date
      while (current_date += 1.week) <= end_date
        dates << current_date
      end
    end

    dates.uniq.sort
  end

  def calculate_monthly_dates
    # 1 year of monthly tasks
    end_date = @task.scheduled_date + YEAR_AHEAD
    dates = []
    current_date = @task.scheduled_date

    while (current_date += 1.month) <= end_date
      dates << current_date
    end

    dates
  end

  def calculate_weekday_dates
    # 1 month of weekday tasks (Mon-Fri)
    end_date = @task.scheduled_date + MONTH_AHEAD
    dates = []
    current_date = @task.scheduled_date

    while (current_date += 1.day) <= end_date
      dates << current_date if weekday?(current_date)
    end

    dates
  end

  def calculate_weekend_dates
    # 1 month of weekend tasks (Sat-Sun)
    end_date = @task.scheduled_date + MONTH_AHEAD
    dates = []
    current_date = @task.scheduled_date

    while (current_date += 1.day) <= end_date
      dates << current_date if weekend?(current_date)
    end

    dates
  end

  def dates_for_weekly_days(base_date)
    # weekly_days contains day names like ["monday", "wednesday", "friday"]
    # beginning_of_week returns Monday, so we need offsets from Monday
    day_offsets = {
      'monday' => 0, 'tuesday' => 1, 'wednesday' => 2, 'thursday' => 3,
      'friday' => 4, 'saturday' => 5, 'sunday' => 6
    }

    start_of_week = base_date.beginning_of_week
    @task.weekly_days.map do |day_name|
      offset = day_offsets[day_name.downcase]
      start_of_week + offset.days if offset
    end.compact
  end

  def calculate_next_date
    case @task.recurrence
    when "daily"
      @task.scheduled_date + 1.day
    when "weekly"
      @task.scheduled_date + 1.week
    when "monthly"
      @task.scheduled_date + 1.month
    when "weekdays"
      next_weekday(@task.scheduled_date)
    when "weekends"
      next_weekend(@task.scheduled_date)
    else
      nil
    end
  end

  def next_weekday(from_date)
    date = from_date + 1.day
    date += 1.day until weekday?(date)
    date
  end

  def next_weekend(from_date)
    date = from_date + 1.day
    date += 1.day until weekend?(date)
    date
  end

  def weekday?(date)
    (1..5).include?(date.wday) # Monday = 1, Friday = 5
  end

  def weekend?(date)
    [0, 6].include?(date.wday) # Sunday = 0, Saturday = 6
  end

  def occurrence_exists?(date)
    Task.where(
      title: @task.title,
      scheduled_date: date,
      recurrence_parent_id: parent_id
    ).exists?
  end

  def parent_id
    @task.recurrence_parent_id || @task.id
  end

  def create_occurrence_for_date(date)
    return if occurrence_exists?(date)

    new_task = @task.dup
    new_task.assign_attributes(
      scheduled_date: date,
      status: :backlog,
      carried_over: false,
      recurrence_parent_id: parent_id,
      created_at: nil,
      updated_at: nil
    )
    new_task.tag_ids = @task.tag_ids
    new_task.save!
    new_task
  end
end
