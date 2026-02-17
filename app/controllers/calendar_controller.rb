class CalendarController < ApplicationController
  def show
    @selected_date = params[:date] ? Date.parse(params[:date]) : Date.today
    @current_month = params[:month] ? Date.parse(params[:month]) : @selected_date
    @view_mode = params[:view] || 'week'

    @tasks = Task.for_date(@selected_date)
                 .includes(:tags)
                 .ordered
    @carried_over = Task.for_date(@selected_date)
                        .carried_over
                        .includes(:tags)
                        .ordered
    @all_tasks = @tasks + @carried_over
    @remaining_tasks = @all_tasks.reject { |t| t.done? }.count

    # Calculate calendar days
    if @view_mode == 'week'
      @calendar_days = week_days(@current_month)
    else
      @calendar_days = month_days(@current_month)
    end

    @tags = Tag.all.order(:name)
  end

  private

  def week_days(date)
    start_date = date.beginning_of_week(:sunday)
    end_date = date.end_of_week(:sunday)
    (start_date..end_date).to_a
  end

  def month_days(date)
    start_date = date.beginning_of_month
    end_date = date.end_of_month

    # Pad start with previous month days
    padding_days = start_date.wday
    padded_start = start_date - padding_days.days

    days = (padded_start..end_date).to_a

    # Pad end to complete last week
    remaining = 7 - (days.count % 7)
    if remaining < 7
      days += (1..remaining).map { |i| end_date + i.days }
    end

    days
  end
end
