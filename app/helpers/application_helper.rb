module ApplicationHelper
  def javascript_importmap_tags
    imports = {
      "application" => "/js/application.js",
      "@hotwired/turbo-rails" => "/js/turbo.min.js",
      "@hotwired/stimulus" => "/js/stimulus.min.js",
      "@hotwired/stimulus-loading" => "/js/stimulus-loading.js",
      "controllers" => "/js/controllers/index.js",
      "controllers/application" => "/js/controllers/application.js",
      "controllers/responsive_controller" => "/js/controllers/responsive_controller.js",
      "controllers/modal_controller" => "/js/controllers/modal_controller.js",
      "controllers/sidebar_controller" => "/js/controllers/sidebar_controller.js",
      "controllers/search_controller" => "/js/controllers/search_controller.js",
      "controllers/button_group_controller" => "/js/controllers/button_group_controller.js",
      "controllers/calendar_controller" => "/js/controllers/calendar_controller.js",
      "controllers/chart_controller" => "/js/controllers/chart_controller.js",
      "controllers/notifications_controller" => "/js/controllers/notifications_controller.js",
      "controllers/tag_color_controller" => "/js/controllers/tag_color_controller.js",
      "controllers/flash_controller" => "/js/controllers/flash_controller.js",
      "controllers/task_item_controller" => "/js/controllers/task_item_controller.js",
      "controllers/task_form_controller" => "/js/controllers/task_form_controller.js",
      "controllers/bulk_select_controller" => "/js/controllers/bulk_select_controller.js",
      "trix" => "/js/trix.js",
      "@rails/actiontext" => "/js/actiontext.esm.js"
    }

    importmap_json = { imports: imports }.to_json

    safe_join [
      tag.script(importmap_json.html_safe, type: "importmap"),
      tag.script('import "application"'.html_safe, type: "module")
    ], "\n"
  end

  def format_time(time)
    return nil unless time
    time.strftime('%l:%M %p').strip
  end

  def format_time_range(task)
    return nil unless task.start_time

    if task.end_time
      "#{format_time(task.start_time)} - #{format_time(task.end_time)}"
    else
      format_time(task.start_time)
    end
  end

  def format_date(date)
    return nil unless date
    date.strftime('%B %-d, %Y')
  end

  def format_short_date(date)
    return nil unless date
    date.strftime('%b %-d')
  end
end
