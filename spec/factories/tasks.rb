FactoryBot.define do
  factory :task do
    sequence(:title) { |n| "Task #{n}" }
    description { "Task description" }
    scheduled_date { Date.today }
    start_time { nil }
    end_time { nil }
    status { :backlog }
    priority { :medium }
    category { :personal }
    recurrence { :one_time }
    remind { false }
    carried_over { false }
    original_date { nil }
  end
end
