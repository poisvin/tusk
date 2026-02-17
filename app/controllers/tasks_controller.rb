class TasksController < ApplicationController
  before_action :set_task, only: [:show, :edit, :update, :destroy, :toggle_status, :reschedule]
  before_action :set_tags, only: [:new, :edit, :create, :update]

  def index
    @date = params[:date] ? Date.parse(params[:date]) : Date.today
    @tasks = Task.for_date(@date)
                 .where(carried_over: [false, nil])
                 .includes(:tags)
                 .order(Arel.sql('start_time IS NULL, start_time ASC'))
    @carried_over = Task.for_date(@date)
                        .carried_over
                        .includes(:tags)
                        .order(Arel.sql('start_time IS NULL, start_time ASC'))
    @all_tasks = @tasks + @carried_over
  end

  def show
    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  def new
    @task = Task.new(scheduled_date: params[:date] || Date.today)
    render_modal
  end

  def edit
    render_modal
  end

  def create
    @task = Task.new(task_params)

    respond_to do |format|
      if @task.save
        format.html { redirect_to tasks_path, notice: "Task created successfully." }
        format.turbo_stream { redirect_to tasks_path, notice: "Task created successfully." }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.turbo_stream { render :new, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @task.update(task_params)
        format.html { redirect_to tasks_path, notice: "Task updated successfully." }
        format.turbo_stream { redirect_to tasks_path, notice: "Task updated successfully." }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.turbo_stream { render :edit, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @task.destroy

    respond_to do |format|
      format.html { redirect_to tasks_path, notice: "Task deleted successfully." }
      format.turbo_stream { redirect_to tasks_path, notice: "Task deleted successfully." }
    end
  end

  def toggle_status
    new_status = @task.done? ? :backlog : :done
    @task.update(status: new_status)

    respond_to do |format|
      format.html { redirect_to tasks_path }
      format.turbo_stream
    end
  end

  def reschedule
    if @task.update(scheduled_date: params[:date])
      render json: { ok: true }
    else
      render json: { error: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_task
    @task = Task.includes(:tags, :task_updates, :notes).find(params[:id])
  end

  def set_tags
    @tags = Tag.all.order(:name)
  end

  def task_params
    params.require(:task).permit(
      :title, :description, :scheduled_date, :start_time, :end_time,
      :status, :priority, :category, :recurrence, :remind,
      tag_ids: [], weekly_days: []
    )
  end

  def render_modal
    render layout: false if turbo_frame_request?
  end
end
