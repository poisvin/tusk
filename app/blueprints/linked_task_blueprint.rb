class LinkedTaskBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :status, :scheduled_date
end
