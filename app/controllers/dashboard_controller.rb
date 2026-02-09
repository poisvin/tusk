class DashboardController < ApplicationController
  def show
    # Weekly stats (current week, Monday to Sunday)
    @week_start = Date.today.beginning_of_week
    @week_end = Date.today.end_of_week

    weekly_tasks = Task.where(scheduled_date: @week_start..@week_end)

    @weekly_stats = {
      total: weekly_tasks.count,
      completed: weekly_tasks.where(status: [:done, :closed]).count,
      in_progress: weekly_tasks.where(status: :in_progress).count,
      blocked: weekly_tasks.where(status: :blocked).count,
      carried_over: weekly_tasks.where(carried_over: true).count,
      pending: weekly_tasks.where(status: [:backlog, :partial]).count
    }

    # Weekly notes count
    @weekly_notes = Note.where(created_at: @week_start.beginning_of_day..@week_end.end_of_day).count

    # Monthly chart data (last 30 days)
    @monthly_data = (0..29).map do |days_ago|
      date = Date.today - days_ago
      {
        date: date.strftime('%Y-%m-%d'),
        label: date.strftime('%b %d'),
        created: Task.where(created_at: date.beginning_of_day..date.end_of_day).count,
        completed: Task.where(status: [:done, :closed])
                      .where("updated_at >= ? AND updated_at <= ?", date.beginning_of_day, date.end_of_day)
                      .count
      }
    end.reverse
  end
end
