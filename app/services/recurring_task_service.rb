class RecurringTaskService
  def initialize(task)
    @task = task
  end

  def create_next_occurrence
    return nil if @task.one_time?
    return nil if next_occurrence_exists?

    next_date = calculate_next_date
    return nil if next_date.nil?

    new_task = @task.dup
    new_task.assign_attributes(
      scheduled_date: next_date,
      status: :backlog,
      carried_over: false,
      created_at: nil,
      updated_at: nil
    )
    new_task.tag_ids = @task.tag_ids
    new_task.save!
    new_task
  end

  private

  def calculate_next_date
    case @task.recurrence
    when "daily"
      @task.scheduled_date + 1.day
    when "weekly"
      @task.scheduled_date + 1.week
    when "monthly"
      @task.scheduled_date + 1.month
    else
      nil
    end
  end

  def next_occurrence_exists?
    next_date = calculate_next_date
    return true if next_date.nil?

    Task.where(
      title: @task.title,
      scheduled_date: next_date,
      recurrence: @task.recurrence
    ).exists?
  end
end
