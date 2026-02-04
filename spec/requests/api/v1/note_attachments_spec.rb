require 'rails_helper'

RSpec.describe "Note Attachments API", type: :request do
  describe "POST /api/v1/notes with attachments" do
    it "creates a note with attachments" do
      file = fixture_file_upload(
        Rails.root.join('spec/fixtures/files/test.txt'),
        'text/plain'
      )

      post "/api/v1/notes", params: {
        note: {
          title: "Note with file",
          content: "Content here",
          category: "work",
          attachments: [file]
        }
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["attachments"].length).to eq(1)
      expect(json["attachments"][0]["filename"]).to eq("test.txt")
    end
  end

  describe "PATCH /api/v1/notes/:id with attachments" do
    let(:note) { create(:note) }

    it "adds attachments to existing note" do
      file = fixture_file_upload(
        Rails.root.join('spec/fixtures/files/test.txt'),
        'text/plain'
      )

      patch "/api/v1/notes/#{note.id}", params: {
        note: { attachments: [file] }
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["attachments"].length).to eq(1)
    end
  end

  describe "DELETE /api/v1/notes/:id/attachments/:attachment_id" do
    let(:note) { create(:note) }

    before do
      note.attachments.attach(
        io: StringIO.new("file content"),
        filename: "test.txt",
        content_type: "text/plain"
      )
    end

    it "removes an attachment from a note" do
      attachment_id = note.attachments.first.id

      delete "/api/v1/notes/#{note.id}/attachments/#{attachment_id}"

      expect(response).to have_http_status(:no_content)
      expect(note.reload.attachments.count).to eq(0)
    end
  end

  describe "GET /api/v1/notes/:id" do
    let(:note) { create(:note) }

    before do
      note.attachments.attach(
        io: StringIO.new("file content"),
        filename: "test.txt",
        content_type: "text/plain"
      )
    end

    it "includes attachments in response" do
      get "/api/v1/notes/#{note.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["attachments"]).to be_an(Array)
      expect(json["attachments"].length).to eq(1)
      expect(json["attachments"][0]).to include(
        "filename" => "test.txt",
        "content_type" => "text/plain"
      )
    end
  end
end
