class Note < ApplicationRecord
  has_and_belongs_to_many :tags
  has_and_belongs_to_many :tasks

  validates :title, presence: true

  enum :category, { personal: 0, work: 1, ideas: 2 }
end
