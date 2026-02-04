class NoteBlueprint < Blueprinter::Base
  identifier :id
  fields :title, :content, :category, :created_at, :updated_at
  association :tags, blueprint: TagBlueprint
  association :tasks, blueprint: LinkedTaskBlueprint, name: :linked_tasks
end
