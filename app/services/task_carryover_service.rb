class TaskCarryoverService
  def self.process(target_date = Date.today)
    new(target_date).process
  end

  def initialize(target_date)
    @target_date = target_date
  end

  def process
    incomplete_tasks.find_each do |task|
      task.update!(
        scheduled_date: @target_date,
        carried_over: true,
        original_date: task.original_date || task.scheduled_date_was
      )
    end
  end

  private

  def incomplete_tasks
    # Only carry over one-time tasks, not recurring ones
    Task.where(scheduled_date: ...@target_date)
        .where.not(status: :done)
        .where(recurrence: :one_time)
  end
end
