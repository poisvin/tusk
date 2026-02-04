class RecurringTaskService
  MONTH_AHEAD = 1.month

  def initialize(task)
    @task = task
  end

  # Generate all occurrences for the next month
  def generate_month_ahead
    return if @task.one_time?

    end_date = @task.scheduled_date + MONTH_AHEAD
    dates = calculate_dates_until(end_date)

    dates.each do |date|
      create_occurrence_for_date(date)
    end
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

  def calculate_dates_until(end_date)
    dates = []
    current_date = @task.scheduled_date

    case @task.recurrence
    when "daily"
      while (current_date += 1.day) <= end_date
        dates << current_date
      end
    when "weekly"
      while (current_date += 1.week) <= end_date
        # If weekly_days specified, find matching days in that week
        if @task.weekly_days.present? && @task.weekly_days.any?
          week_dates = dates_for_weekly_days(current_date)
          dates.concat(week_dates.select { |d| d <= end_date })
        else
          dates << current_date
        end
      end
    when "monthly"
      while (current_date += 1.month) <= end_date
        dates << current_date
      end
    when "weekdays"
      while (current_date += 1.day) <= end_date
        dates << current_date if weekday?(current_date)
      end
    when "weekends"
      while (current_date += 1.day) <= end_date
        dates << current_date if weekend?(current_date)
      end
    end

    dates.uniq.sort
  end

  def dates_for_weekly_days(base_date)
    # weekly_days contains day names like ["monday", "wednesday", "friday"]
    start_of_week = base_date.beginning_of_week
    @task.weekly_days.map do |day_name|
      day_index = Date::DAYNAMES.map(&:downcase).index(day_name.downcase)
      start_of_week + day_index.days if day_index
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
