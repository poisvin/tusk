# Force include importmap helpers
Rails.application.config.to_prepare do
  ActionView::Base.include Importmap::ImportmapTagsHelper
end
