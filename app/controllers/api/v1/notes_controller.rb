module Api
  module V1
    class NotesController < ApplicationController
      def index
        notes = Note.includes(:tags, :tasks).with_attached_attachments.order(updated_at: :desc)
        notes = notes.where(category: params[:category]) if params[:category].present?
        render json: NoteBlueprint.render(notes)
      end

      def show
        note = Note.includes(:tags, :tasks).with_attached_attachments.find(params[:id])
        render json: NoteBlueprint.render(note)
      end

      def create
        note = Note.new(note_params.except(:attachments))
        if note.save
          attach_files(note) if note_params[:attachments].present?
          render json: NoteBlueprint.render(note), status: :created
        else
          render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        note = Note.find(params[:id])
        if note.update(note_params.except(:attachments))
          attach_files(note) if note_params[:attachments].present?
          render json: NoteBlueprint.render(note)
        else
          render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy_attachment
        note = Note.find(params[:id])
        attachment = note.attachments.find(params[:attachment_id])
        attachment.purge
        head :no_content
      end

      def destroy
        note = Note.find(params[:id])
        note.destroy
        head :no_content
      end

      private

      def note_params
        params.require(:note).permit(:title, :content, :category, tag_ids: [], attachments: [])
      end

      def attach_files(note)
        note_params[:attachments].each do |file|
          note.attachments.attach(file)
        end
      end
    end
  end
end
