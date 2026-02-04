class Task < ApplicationRecord
  has_and_belongs_to_many :tags

  # Self-referential association for recurring tasks
  belongs_to :recurrence_parent, class_name: 'Task', optional: true
  has_many :recurrence_children, class_name: 'Task', foreign_key: 'recurrence_parent_id', dependent: :destroy

  validates :title, presence: true
  validates :scheduled_date, presence: true

  enum :status, { backlog: 0, in_progress: 1, partial: 2, done: 3 }
  enum :priority, { low: 0, medium: 1, high: 2 }
  enum :category, { personal: 0, official: 1 }
  enum :recurrence, { one_time: 0, daily: 1, weekly: 2, monthly: 3, weekdays: 4, weekends: 5 }

  scope :for_date, ->(date) { where(scheduled_date: date) }
  scope :incomplete, -> { where.not(status: :done) }
  scope :carried_over, -> { where(carried_over: true) }

  after_create :generate_recurring_occurrences, if: :should_generate_occurrences?
  after_update :sync_recurring_children, if: :should_sync_children?

  # Get all tasks in this recurrence series
  def recurrence_series
    if recurrence_parent_id.present?
      Task.where(recurrence_parent_id: recurrence_parent_id).or(Task.where(id: recurrence_parent_id))
    else
      Task.where(recurrence_parent_id: id).or(Task.where(id: id))
    end
  end

  # Get future tasks in this series
  def future_occurrences
    recurrence_series.where('scheduled_date > ?', scheduled_date)
  end

  private

  def should_generate_occurrences?
    # Only generate for parent tasks (not children) that have recurrence
    !one_time? && recurrence_parent_id.nil?
  end

  def generate_recurring_occurrences
    RecurringTaskService.new(self).generate_month_ahead
  end

  def should_sync_children?
    # Sync if time or core fields changed (but not status)
    (saved_change_to_start_time? || saved_change_to_end_time? ||
     saved_change_to_title? || saved_change_to_description? ||
     saved_change_to_priority? || saved_change_to_category?) &&
    !saved_change_to_status?
  end

  def sync_recurring_children
    return if recurrence_parent_id.present? # Only parent syncs to children

    future_occurrences.find_each do |child|
      child.update_columns(
        start_time: start_time,
        end_time: end_time,
        title: title,
        description: description,
        priority: Task.priorities[priority],
        category: Task.categories[category]
      )
    end
  end
end
