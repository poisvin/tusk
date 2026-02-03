require 'rails_helper'

RSpec.describe TaskCarryoverService do
  describe '.process' do
    it 'carries over incomplete tasks from yesterday' do
      yesterday_task = create(:task,
        title: "Incomplete task",
        scheduled_date: Date.yesterday,
        status: :backlog
      )

      TaskCarryoverService.process(Date.today)

      yesterday_task.reload
      expect(yesterday_task.scheduled_date).to eq(Date.today)
      expect(yesterday_task.carried_over).to be true
      expect(yesterday_task.original_date).to eq(Date.yesterday)
    end

    it 'does not carry over completed tasks' do
      done_task = create(:task,
        scheduled_date: Date.yesterday,
        status: :done
      )

      TaskCarryoverService.process(Date.today)

      done_task.reload
      expect(done_task.scheduled_date).to eq(Date.yesterday)
      expect(done_task.carried_over).to be false
    end

    it 'does not re-carry already carried tasks' do
      already_carried = create(:task,
        scheduled_date: Date.yesterday,
        carried_over: true,
        original_date: 2.days.ago
      )

      TaskCarryoverService.process(Date.today)

      already_carried.reload
      expect(already_carried.scheduled_date).to eq(Date.yesterday)
    end

    it 'preserves original_date when carrying over multiple times' do
      old_task = create(:task,
        scheduled_date: 3.days.ago,
        original_date: nil,
        status: :backlog
      )

      TaskCarryoverService.process(2.days.ago)
      old_task.reload
      first_original = old_task.original_date

      # Simulate another carryover
      old_task.update!(carried_over: false)
      TaskCarryoverService.process(Date.yesterday)
      old_task.reload

      expect(old_task.original_date).to eq(first_original)
    end
  end
end
