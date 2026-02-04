# spec/requests/api/v1/linked_notes_spec.rb
require 'rails_helper'

RSpec.describe "Api::V1::LinkedNotes", type: :request do
  let(:task) { create(:task) }
  let(:note) { create(:note) }

  describe "POST /api/v1/tasks/:task_id/linked_notes" do
    it "links a note to a task" do
      post "/api/v1/tasks/#{task.id}/linked_notes", params: {
        note_id: note.id
      }

      expect(response).to have_http_status(:created)
      expect(task.notes).to include(note)
      expect(note.tasks).to include(task)
    end

    it "does not duplicate links" do
      task.notes << note

      post "/api/v1/tasks/#{task.id}/linked_notes", params: {
        note_id: note.id
      }

      expect(response).to have_http_status(:ok)
      expect(task.notes.count).to eq(1)
    end
  end

  describe "DELETE /api/v1/tasks/:task_id/linked_notes/:id" do
    it "unlinks a note from a task" do
      task.notes << note

      delete "/api/v1/tasks/#{task.id}/linked_notes/#{note.id}"

      expect(response).to have_http_status(:no_content)
      expect(task.notes).not_to include(note)
    end
  end
end
