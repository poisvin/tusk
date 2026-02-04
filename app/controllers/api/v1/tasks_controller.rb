module Api
  module V1
    class TasksController < ApplicationController
      def index
        date = params[:date] ? Date.parse(params[:date]) : Date.today

        tasks = Task.for_date(date).where(carried_over: [false, nil]).includes(:tags, :task_updates, :notes)
        carried_over = Task.for_date(date).carried_over.includes(:tags, :task_updates, :notes)

        render json: {
          tasks: TaskBlueprint.render_as_hash(tasks),
          carried_over: TaskBlueprint.render_as_hash(carried_over)
        }
      end

      def show
        task = Task.includes(:tags, :task_updates, :notes).find(params[:id])
        render json: TaskBlueprint.render(task)
      end

      def create
        task = Task.new(task_params)
        if task.save
          render json: TaskBlueprint.render(task), status: :created
        else
          render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        task = Task.find(params[:id])
        if task.update(task_params)
          render json: TaskBlueprint.render(task)
        else
          render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        task = Task.find(params[:id])
        task.destroy
        head :no_content
      end

      private

      def task_params
        params.require(:task).permit(
          :title, :description, :scheduled_date, :start_time, :end_time,
          :status, :priority, :category, :recurrence, :remind, :carried_over,
          :original_date, tag_ids: [], weekly_days: []
        )
      end
    end
  end
end
