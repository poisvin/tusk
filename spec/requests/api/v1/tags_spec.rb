require 'rails_helper'

RSpec.describe "Api::V1::Tags", type: :request do
  describe "GET /api/v1/tags" do
    it "returns all tags ordered by name" do
      create(:tag, name: "zebra")
      create(:tag, name: "alpha")

      get "/api/v1/tags"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
      expect(json.first["name"]).to eq("alpha")
    end
  end

  describe "POST /api/v1/tags" do
    it "creates a tag" do
      post "/api/v1/tags", params: { tag: { name: "marketing", color: "#00ff00" } }

      expect(response).to have_http_status(:created)
      expect(Tag.count).to eq(1)
      expect(Tag.first.name).to eq("marketing")
    end

    it "returns error for duplicate name" do
      create(:tag, name: "sales")

      post "/api/v1/tags", params: { tag: { name: "sales" } }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "DELETE /api/v1/tags/:id" do
    it "deletes a tag" do
      tag = create(:tag)

      delete "/api/v1/tags/#{tag.id}"

      expect(response).to have_http_status(:no_content)
      expect(Tag.count).to eq(0)
    end
  end
end
