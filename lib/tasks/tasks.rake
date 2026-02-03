namespace :tasks do
  desc "Carry over incomplete tasks from previous days to today"
  task carryover: :environment do
    puts "Processing task carryover for #{Date.today}..."

    count_before = Task.where(carried_over: true, scheduled_date: Date.today).count
    TaskCarryoverService.process
    count_after = Task.where(carried_over: true, scheduled_date: Date.today).count

    carried_over = count_after - count_before
    puts "Carried over #{carried_over} task(s) to today."
  end

  desc "Generate next occurrences for recurring tasks that are due"
  task generate_recurring: :environment do
    puts "Generating recurring tasks..."

    # Find recurring tasks that are done and might need next occurrence
    Task.where.not(recurrence: :one_time)
        .where(status: :done)
        .find_each do |task|
      RecurringTaskService.new(task).create_next_occurrence
    end

    puts "Done generating recurring tasks."
  end
end
