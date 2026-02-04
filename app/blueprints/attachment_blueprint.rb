class AttachmentBlueprint < Blueprinter::Base
  identifier :id

  field :filename do |attachment|
    attachment.filename.to_s
  end

  field :content_type do |attachment|
    attachment.content_type
  end

  field :byte_size do |attachment|
    attachment.byte_size
  end

  field :url do |attachment, options|
    Rails.application.routes.url_helpers.rails_blob_path(attachment, only_path: true)
  end
end
