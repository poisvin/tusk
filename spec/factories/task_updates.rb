FactoryBot.define do
  factory :task_update do
    task
    sequence(:content) { |n| "Progress update #{n}" }
  end
end
