# app/controllers/api/v1/linked_notes_controller.rb
module Api
  module V1
    class LinkedNotesController < ApplicationController
      before_action :set_task

      def create
        note = Note.find(params[:note_id])

        if @task.notes.include?(note)
          render json: { message: "Note already linked" }, status: :ok
        else
          @task.notes << note
          render json: NoteBlueprint.render(note), status: :created
        end
      end

      def destroy
        note = @task.notes.find(params[:id])
        @task.notes.delete(note)
        head :no_content
      end

      private

      def set_task
        @task = Task.find(params[:task_id])
      end
    end
  end
end
