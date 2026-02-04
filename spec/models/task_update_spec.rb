# spec/models/task_update_spec.rb
require 'rails_helper'

RSpec.describe TaskUpdate, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:content) }
  end

  describe 'associations' do
    it { should belong_to(:task) }
  end

  describe 'ordering' do
    it 'orders by created_at descending (newest first)' do
      task = create(:task)
      old_update = create(:task_update, task: task, created_at: 2.hours.ago)
      new_update = create(:task_update, task: task, created_at: 1.hour.ago)

      expect(task.task_updates).to eq([new_update, old_update])
    end
  end
end
