require 'rails_helper'

RSpec.describe RecurringTaskService do
  describe '#create_next_occurrence' do
    let(:scheduled_date) { Date.today }

    context 'with a daily recurring task' do
      let(:task) { create(:task, recurrence: :daily, scheduled_date: scheduled_date) }

      it 'creates next occurrence for tomorrow' do
        service = described_class.new(task)
        new_task = service.create_next_occurrence

        expect(new_task).to be_persisted
        expect(new_task.scheduled_date).to eq(scheduled_date + 1.day)
        expect(new_task.status).to eq('backlog')
        expect(new_task.recurrence).to eq('daily')
      end

      it 'does not create duplicate occurrence' do
        service = described_class.new(task)
        service.create_next_occurrence

        expect { service.create_next_occurrence }.not_to change(Task, :count)
      end
    end

    context 'with a weekly recurring task' do
      let(:task) { create(:task, recurrence: :weekly, scheduled_date: scheduled_date) }

      it 'creates next occurrence for next week' do
        service = described_class.new(task)
        new_task = service.create_next_occurrence

        expect(new_task.scheduled_date).to eq(scheduled_date + 1.week)
      end
    end

    context 'with a monthly recurring task' do
      let(:task) { create(:task, recurrence: :monthly, scheduled_date: scheduled_date) }

      it 'creates next occurrence for next month' do
        service = described_class.new(task)
        new_task = service.create_next_occurrence

        expect(new_task.scheduled_date).to eq(scheduled_date + 1.month)
      end
    end

    context 'with a one_time task' do
      let(:task) { create(:task, recurrence: :one_time, scheduled_date: scheduled_date) }

      it 'does not create next occurrence' do
        service = described_class.new(task)
        new_task = service.create_next_occurrence

        expect(new_task).to be_nil
      end
    end

    context 'with tags' do
      let(:tag) { create(:tag) }
      let(:task) { create(:task, recurrence: :daily, scheduled_date: scheduled_date, tags: [tag]) }

      it 'copies tags to next occurrence' do
        service = described_class.new(task)
        new_task = service.create_next_occurrence

        expect(new_task.tags).to include(tag)
      end
    end
  end
end
