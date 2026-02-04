class NoteBlueprint < Blueprinter::Base
  identifier :id
  fields :title, :content, :category, :created_at, :updated_at
  association :tags, blueprint: TagBlueprint
  association :tasks, blueprint: LinkedTaskBlueprint, name: :linked_tasks

  field :attachments do |note|
    note.attachments.map do |attachment|
      AttachmentBlueprint.render_as_hash(attachment)
    end
  end
end
