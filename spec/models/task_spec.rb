require 'rails_helper'

RSpec.describe Task, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:scheduled_date) }
  end

  describe 'enums' do
    it { should define_enum_for(:status).with_values(backlog: 0, in_progress: 1, partial: 2, done: 3) }
    it { should define_enum_for(:priority).with_values(low: 0, medium: 1, high: 2) }
    it { should define_enum_for(:category).with_values(personal: 0, official: 1) }
    it { should define_enum_for(:recurrence).with_values(none: 0, daily: 1, weekly: 2, monthly: 3) }
  end

  describe 'associations' do
    it { should have_and_belong_to_many(:tags) }
  end

  describe 'scopes' do
    let!(:today_task) { create(:task, scheduled_date: Date.today) }
    let!(:yesterday_task) { create(:task, scheduled_date: Date.yesterday, status: :backlog, carried_over: true) }
    let!(:done_task) { create(:task, scheduled_date: Date.today, status: :done) }

    it 'returns tasks for a specific date' do
      expect(Task.for_date(Date.today)).to include(today_task, done_task)
      expect(Task.for_date(Date.today)).not_to include(yesterday_task)
    end

    it 'returns incomplete tasks' do
      expect(Task.incomplete).to include(today_task, yesterday_task)
      expect(Task.incomplete).not_to include(done_task)
    end

    it 'returns carried over tasks' do
      expect(Task.carried_over).to include(yesterday_task)
      expect(Task.carried_over).not_to include(today_task)
    end
  end
end
