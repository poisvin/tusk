module Api
  module V1
    class NotesController < ApplicationController
      def index
        notes = Note.includes(:tags).order(updated_at: :desc)
        notes = notes.where(category: params[:category]) if params[:category].present?
        render json: NoteBlueprint.render(notes)
      end

      def show
        note = Note.find(params[:id])
        render json: NoteBlueprint.render(note)
      end

      def create
        note = Note.new(note_params)
        if note.save
          render json: NoteBlueprint.render(note), status: :created
        else
          render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        note = Note.find(params[:id])
        if note.update(note_params)
          render json: NoteBlueprint.render(note)
        else
          render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        note = Note.find(params[:id])
        note.destroy
        head :no_content
      end

      private

      def note_params
        params.require(:note).permit(:title, :content, :category, tag_ids: [])
      end
    end
  end
end
