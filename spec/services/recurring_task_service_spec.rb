require 'rails_helper'

RSpec.describe RecurringTaskService do
  # Create tasks without triggering the after_create callback
  # by setting recurrence_parent_id (simulating a child task that won't auto-generate)
  # or by using build + save with skip callback

  describe '#generate_month_ahead' do
    let(:scheduled_date) { Date.today }

    context 'with a daily recurring task' do
      let(:task) do
        # Build and save without callbacks to test the service in isolation
        task = build(:task, recurrence: :daily, scheduled_date: scheduled_date)
        task.save(validate: false)
        Task.find(task.id) # Reload to clear any cached data
      end

      before do
        # Clear any auto-generated tasks
        Task.where.not(id: task.id).delete_all
      end

      it 'creates occurrences for approximately 30 days' do
        service = described_class.new(task)
        service.generate_month_ahead

        # Should create roughly 30 occurrences (1 month of daily tasks)
        child_tasks = Task.where(recurrence_parent_id: task.id)
        expect(child_tasks.count).to be_within(2).of(30)
      end

      it 'sets recurrence_parent_id on child tasks' do
        service = described_class.new(task)
        service.generate_month_ahead

        child_task = Task.where(recurrence_parent_id: task.id).first
        expect(child_task.recurrence_parent_id).to eq(task.id)
      end

      it 'does not create duplicates when called again' do
        service = described_class.new(task)
        service.generate_month_ahead

        initial_count = Task.count
        service.generate_month_ahead

        expect(Task.count).to eq(initial_count)
      end
    end

    context 'with a weekly recurring task' do
      let(:task) do
        task = build(:task, recurrence: :weekly, scheduled_date: scheduled_date)
        task.save(validate: false)
        Task.find(task.id)
      end

      before do
        Task.where.not(id: task.id).delete_all
      end

      it 'creates approximately 4 occurrences for next month' do
        service = described_class.new(task)
        service.generate_month_ahead

        child_tasks = Task.where(recurrence_parent_id: task.id)
        expect(child_tasks.count).to be_within(1).of(4)
      end
    end

    context 'with a monthly recurring task' do
      let(:task) do
        task = build(:task, recurrence: :monthly, scheduled_date: scheduled_date)
        task.save(validate: false)
        Task.find(task.id)
      end

      before do
        Task.where.not(id: task.id).delete_all
      end

      it 'creates 1 occurrence for next month' do
        service = described_class.new(task)
        service.generate_month_ahead

        child_tasks = Task.where(recurrence_parent_id: task.id)
        expect(child_tasks.count).to eq(1)
        expect(child_tasks.first.scheduled_date).to eq(scheduled_date + 1.month)
      end
    end

    context 'with a weekdays recurring task' do
      let(:task) do
        task = build(:task, recurrence: :weekdays, scheduled_date: scheduled_date)
        task.save(validate: false)
        Task.find(task.id)
      end

      before do
        Task.where.not(id: task.id).delete_all
      end

      it 'creates occurrences only for weekdays' do
        service = described_class.new(task)
        service.generate_month_ahead

        child_tasks = Task.where(recurrence_parent_id: task.id)
        # Each week has 5 weekdays, so roughly 20-22 occurrences
        expect(child_tasks.count).to be_within(3).of(22)

        # Verify all are weekdays (Monday=1 to Friday=5)
        child_tasks.each do |t|
          expect(t.scheduled_date.wday).to be_between(1, 5)
        end
      end
    end

    context 'with a weekends recurring task' do
      let(:task) do
        task = build(:task, recurrence: :weekends, scheduled_date: scheduled_date)
        task.save(validate: false)
        Task.find(task.id)
      end

      before do
        Task.where.not(id: task.id).delete_all
      end

      it 'creates occurrences only for weekends' do
        service = described_class.new(task)
        service.generate_month_ahead

        child_tasks = Task.where(recurrence_parent_id: task.id)
        # Each week has 2 weekend days, so roughly 8-9 occurrences
        expect(child_tasks.count).to be_within(2).of(8)

        # Verify all are weekends (Sunday=0, Saturday=6)
        child_tasks.each do |t|
          expect([0, 6]).to include(t.scheduled_date.wday)
        end
      end
    end

    context 'with a one_time task' do
      let(:task) do
        task = build(:task, recurrence: :one_time, scheduled_date: scheduled_date)
        task.save(validate: false)
        Task.find(task.id)
      end

      before do
        Task.where.not(id: task.id).delete_all
      end

      it 'does not create any occurrences' do
        service = described_class.new(task)
        service.generate_month_ahead

        child_tasks = Task.where(recurrence_parent_id: task.id)
        expect(child_tasks.count).to eq(0)
      end
    end

    context 'with tags' do
      let(:tag) { create(:tag) }
      let(:task) do
        task = build(:task, recurrence: :daily, scheduled_date: scheduled_date)
        task.save(validate: false)
        task.tags << tag
        Task.find(task.id)
      end

      before do
        Task.where.not(id: task.id).delete_all
      end

      it 'copies tags to all occurrences' do
        service = described_class.new(task)
        service.generate_month_ahead

        child_tasks = Task.where(recurrence_parent_id: task.id)
        child_tasks.each do |child|
          expect(child.tags).to include(tag)
        end
      end
    end
  end

  describe 'after_create callback integration' do
    it 'automatically generates occurrences when creating a recurring task' do
      task = create(:task, recurrence: :daily, scheduled_date: Date.today)

      # The callback should have created child tasks
      child_tasks = Task.where(recurrence_parent_id: task.id)
      expect(child_tasks.count).to be > 0
    end

    it 'does not generate occurrences for one_time tasks' do
      task = create(:task, recurrence: :one_time, scheduled_date: Date.today)

      child_tasks = Task.where(recurrence_parent_id: task.id)
      expect(child_tasks.count).to eq(0)
    end

    it 'does not generate occurrences for child tasks (prevents infinite recursion)' do
      parent = create(:task, recurrence: :daily, scheduled_date: Date.today)
      initial_count = Task.count

      # Manually create a child task - it should not trigger generation
      child = Task.create!(
        title: 'Child Task',
        scheduled_date: Date.tomorrow,
        recurrence: :daily,
        recurrence_parent_id: parent.id
      )

      # No new tasks should have been created beyond the child itself
      expect(Task.count).to eq(initial_count + 1)
    end
  end
end
