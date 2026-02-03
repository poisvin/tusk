require 'rails_helper'

RSpec.describe "Api::V1::Notes", type: :request do
  describe "GET /api/v1/notes" do
    it "returns all notes ordered by updated_at desc" do
      old_note = create(:note, updated_at: 1.day.ago)
      new_note = create(:note, updated_at: Time.current)

      get "/api/v1/notes"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
      expect(json.first["id"]).to eq(new_note.id)
    end

    it "filters by category" do
      personal = create(:note, category: :personal)
      work = create(:note, category: :work)

      get "/api/v1/notes", params: { category: "work" }

      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json.first["id"]).to eq(work.id)
    end
  end

  describe "POST /api/v1/notes" do
    it "creates a note" do
      post "/api/v1/notes", params: {
        note: { title: "Meeting notes", content: "Discussed project", category: "work" }
      }

      expect(response).to have_http_status(:created)
      expect(Note.count).to eq(1)
    end
  end

  describe "PATCH /api/v1/notes/:id" do
    it "updates a note" do
      note = create(:note, title: "Old title")

      patch "/api/v1/notes/#{note.id}", params: { note: { title: "New title" } }

      expect(response).to have_http_status(:ok)
      expect(note.reload.title).to eq("New title")
    end
  end

  describe "DELETE /api/v1/notes/:id" do
    it "deletes a note" do
      note = create(:note)

      delete "/api/v1/notes/#{note.id}"

      expect(response).to have_http_status(:no_content)
      expect(Note.count).to eq(0)
    end
  end
end
