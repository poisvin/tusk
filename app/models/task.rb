class Task < ApplicationRecord
  has_and_belongs_to_many :tags

  validates :title, presence: true
  validates :scheduled_date, presence: true

  enum :status, { backlog: 0, in_progress: 1, partial: 2, done: 3 }
  enum :priority, { low: 0, medium: 1, high: 2 }
  enum :category, { personal: 0, official: 1 }
  enum :recurrence, { one_time: 0, daily: 1, weekly: 2, monthly: 3 }

  scope :for_date, ->(date) { where(scheduled_date: date) }
  scope :incomplete, -> { where.not(status: :done) }
  scope :carried_over, -> { where(carried_over: true) }

  after_update :create_next_recurring_task, if: :just_completed?

  private

  def just_completed?
    saved_change_to_status? && done?
  end

  def create_next_recurring_task
    return if one_time?
    RecurringTaskService.new(self).create_next_occurrence
  end
end
