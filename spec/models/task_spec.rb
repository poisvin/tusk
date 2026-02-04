require 'rails_helper'

RSpec.describe Task, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:scheduled_date) }
  end

  describe 'enums' do
    it { should define_enum_for(:status).with_values(backlog: 0, in_progress: 1, partial: 2, done: 3, blocked: 4, closed: 5) }
    it { should define_enum_for(:priority).with_values(low: 0, medium: 1, high: 2) }
    it { should define_enum_for(:category).with_values(personal: 0, official: 1) }
    it { should define_enum_for(:recurrence).with_values(one_time: 0, daily: 1, weekly: 2, monthly: 3, weekdays: 4, weekends: 5) }
  end

  describe 'associations' do
    it { should have_and_belong_to_many(:tags) }
    it { should belong_to(:recurrence_parent).class_name('Task').optional }
    it { should have_many(:recurrence_children).class_name('Task').with_foreign_key('recurrence_parent_id').dependent(:destroy) }
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

  describe 'recurring task sync' do
    let(:parent_task) { create(:task, recurrence: :daily, scheduled_date: Date.today) }

    it 'syncs time changes from parent to future children' do
      # Get a future child
      child = Task.where(recurrence_parent_id: parent_task.id).where('scheduled_date > ?', Date.today).first

      # Update parent's time
      parent_task.update!(start_time: '09:00', end_time: '10:00')

      child.reload
      expect(child.start_time.strftime('%H:%M')).to eq('09:00')
      expect(child.end_time.strftime('%H:%M')).to eq('10:00')
    end

    it 'syncs time changes from child to parent and siblings' do
      children = Task.where(recurrence_parent_id: parent_task.id).where('scheduled_date > ?', Date.today).order(:scheduled_date).limit(3)
      first_child = children.first
      second_child = children.second

      # Update child's time
      first_child.update!(start_time: '14:00', end_time: '15:00')

      parent_task.reload
      second_child.reload

      expect(parent_task.start_time.strftime('%H:%M')).to eq('14:00')
      expect(second_child.start_time.strftime('%H:%M')).to eq('14:00')
    end

    it 'regenerates series when recurrence type changes' do
      initial_children_count = Task.where(recurrence_parent_id: parent_task.id).count

      # Change from daily to weekends (fewer occurrences)
      parent_task.update!(recurrence: :weekends)

      # Should have regenerated with fewer tasks
      new_children_count = Task.where(recurrence_parent_id: parent_task.id).count
      expect(new_children_count).to be < initial_children_count

      # All new children should be on weekends
      Task.where(recurrence_parent_id: parent_task.id).each do |child|
        expect([0, 6]).to include(child.scheduled_date.wday)
      end
    end

    it 'does not change status when syncing' do
      child = Task.where(recurrence_parent_id: parent_task.id).first
      child.update_columns(status: Task.statuses[:done])

      # Update parent's title (should sync but not change status)
      parent_task.update!(title: 'Updated Title')

      child.reload
      expect(child.title).to eq('Updated Title')
      expect(child.status).to eq('done')
    end
  end
end
