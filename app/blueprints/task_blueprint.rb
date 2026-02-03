class TaskBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :description, :scheduled_date, :start_time, :end_time,
         :status, :priority, :category, :recurrence, :remind, :carried_over,
         :original_date, :created_at, :updated_at

  association :tags, blueprint: TagBlueprint
end
