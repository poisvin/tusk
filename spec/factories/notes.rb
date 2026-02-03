FactoryBot.define do
  factory :note do
    sequence(:title) { |n| "Note #{n}" }
    content { "Note content" }
    category { :personal }
  end
end
