class Task < ApplicationRecord
  has_and_belongs_to_many :tags

  validates :title, presence: true
  validates :scheduled_date, presence: true

  enum :status, { backlog: 0, in_progress: 1, partial: 2, done: 3 }
  enum :priority, { low: 0, medium: 1, high: 2 }
  enum :category, { personal: 0, official: 1 }
  enum :recurrence, { none: 0, daily: 1, weekly: 2, monthly: 3 }

  scope :for_date, ->(date) { where(scheduled_date: date) }
  scope :incomplete, -> { where.not(status: :done) }
  scope :carried_over, -> { where(carried_over: true) }
end
