require 'rails_helper'

RSpec.describe "Api::V1::Tasks", type: :request do
  describe "GET /api/v1/tasks" do
    it "returns tasks for today by default" do
      task = create(:task, scheduled_date: Date.today)
      create(:task, scheduled_date: Date.yesterday)

      get "/api/v1/tasks"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["tasks"].length).to eq(1)
      expect(json["tasks"].first["id"]).to eq(task.id)
    end

    it "returns tasks for a specific date" do
      task = create(:task, scheduled_date: Date.tomorrow)

      get "/api/v1/tasks", params: { date: Date.tomorrow.to_s }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["tasks"].length).to eq(1)
    end

    it "separates carried over tasks" do
      regular = create(:task, scheduled_date: Date.today, carried_over: false)
      carried = create(:task, scheduled_date: Date.today, carried_over: true, original_date: Date.yesterday)

      get "/api/v1/tasks"

      json = JSON.parse(response.body)
      expect(json["tasks"].length).to eq(1)
      expect(json["carried_over"].length).to eq(1)
      expect(json["carried_over"].first["id"]).to eq(carried.id)
    end
  end

  describe "POST /api/v1/tasks" do
    it "creates a new task" do
      post "/api/v1/tasks", params: {
        task: { title: "New task", scheduled_date: Date.today, category: "personal" }
      }

      expect(response).to have_http_status(:created)
      expect(Task.count).to eq(1)
      expect(Task.first.title).to eq("New task")
    end

    it "returns errors for invalid task" do
      post "/api/v1/tasks", params: { task: { title: "" } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Title can't be blank")
    end
  end

  describe "PATCH /api/v1/tasks/:id" do
    it "updates task status" do
      task = create(:task)

      patch "/api/v1/tasks/#{task.id}", params: { task: { status: "done" } }

      expect(response).to have_http_status(:ok)
      expect(task.reload.status).to eq("done")
    end
  end

  describe "DELETE /api/v1/tasks/:id" do
    it "deletes a task" do
      task = create(:task)

      delete "/api/v1/tasks/#{task.id}"

      expect(response).to have_http_status(:no_content)
      expect(Task.count).to eq(0)
    end
  end
end
