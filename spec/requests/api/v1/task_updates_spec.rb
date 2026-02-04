# spec/requests/api/v1/task_updates_spec.rb
require 'rails_helper'

RSpec.describe "Api::V1::TaskUpdates", type: :request do
  let(:task) { create(:task) }

  describe "GET /api/v1/tasks/:task_id/updates" do
    it "returns task updates newest first" do
      old_update = create(:task_update, task: task, content: "First", created_at: 2.hours.ago)
      new_update = create(:task_update, task: task, content: "Second", created_at: 1.hour.ago)

      get "/api/v1/tasks/#{task.id}/updates"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
      expect(json[0]["content"]).to eq("Second")
      expect(json[1]["content"]).to eq("First")
    end
  end

  describe "POST /api/v1/tasks/:task_id/updates" do
    it "creates a new task update" do
      post "/api/v1/tasks/#{task.id}/updates", params: {
        task_update: { content: "Started working on this" }
      }

      expect(response).to have_http_status(:created)
      expect(task.task_updates.count).to eq(1)
      expect(task.task_updates.first.content).to eq("Started working on this")
    end

    it "returns error for blank content" do
      post "/api/v1/tasks/#{task.id}/updates", params: {
        task_update: { content: "" }
      }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "DELETE /api/v1/tasks/:task_id/updates/:id" do
    it "deletes a task update" do
      update = create(:task_update, task: task)

      delete "/api/v1/tasks/#{task.id}/updates/#{update.id}"

      expect(response).to have_http_status(:no_content)
      expect(TaskUpdate.exists?(update.id)).to be false
    end
  end
end
