class TaskBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :description, :scheduled_date, :start_time, :end_time,
         :status, :priority, :category, :recurrence, :remind, :carried_over,
         :original_date, :weekly_days, :recurrence_parent_id, :created_at, :updated_at

  association :tags, blueprint: TagBlueprint
  association :task_updates, blueprint: TaskUpdateBlueprint
  association :notes, blueprint: NoteBlueprint, name: :linked_notes
end
