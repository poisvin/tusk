class TaskUpdateBlueprint < Blueprinter::Base
  identifier :id

  fields :content, :created_at
end
