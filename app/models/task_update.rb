class TaskUpdate < ApplicationRecord
  belongs_to :task

  validates :content, presence: true

  default_scope { order(created_at: :desc) }
end
