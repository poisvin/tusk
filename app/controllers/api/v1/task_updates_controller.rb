module Api
  module V1
    class TaskUpdatesController < ApplicationController
      before_action :set_task

      def index
        updates = @task.task_updates
        render json: TaskUpdateBlueprint.render(updates)
      end

      def create
        update = @task.task_updates.build(task_update_params)
        if update.save
          render json: TaskUpdateBlueprint.render(update), status: :created
        else
          render json: { errors: update.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        update = @task.task_updates.find(params[:id])
        update.destroy
        head :no_content
      end

      private

      def set_task
        @task = Task.find(params[:task_id])
      end

      def task_update_params
        params.require(:task_update).permit(:content)
      end
    end
  end
end
