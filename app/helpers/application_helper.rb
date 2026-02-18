module ApplicationHelper
  # Cache-bust JS on each deploy (evaluated at boot time)
  JS_CACHE_VERSION = Time.now.to_i.to_s

  def javascript_importmap_tags
    v = JS_CACHE_VERSION
    imports = {
      "application" => "/js/application.js?v=#{v}",
      "@hotwired/turbo-rails" => "/js/turbo.min.js?v=#{v}",
      "@hotwired/stimulus" => "/js/stimulus.min.js?v=#{v}",
      "@hotwired/stimulus-loading" => "/js/stimulus-loading.js?v=#{v}",
      "controllers" => "/js/controllers/index.js?v=#{v}",
      "controllers/application" => "/js/controllers/application.js?v=#{v}",
      "controllers/responsive_controller" => "/js/controllers/responsive_controller.js?v=#{v}",
      "controllers/modal_controller" => "/js/controllers/modal_controller.js?v=#{v}",
      "controllers/sidebar_controller" => "/js/controllers/sidebar_controller.js?v=#{v}",
      "controllers/search_controller" => "/js/controllers/search_controller.js?v=#{v}",
      "controllers/button_group_controller" => "/js/controllers/button_group_controller.js?v=#{v}",
      "controllers/calendar_controller" => "/js/controllers/calendar_controller.js?v=#{v}",
      "controllers/chart_controller" => "/js/controllers/chart_controller.js?v=#{v}",
      "controllers/notifications_controller" => "/js/controllers/notifications_controller.js?v=#{v}",
      "controllers/tag_color_controller" => "/js/controllers/tag_color_controller.js?v=#{v}",
      "controllers/flash_controller" => "/js/controllers/flash_controller.js?v=#{v}",
      "controllers/task_item_controller" => "/js/controllers/task_item_controller.js?v=#{v}",
      "controllers/task_form_controller" => "/js/controllers/task_form_controller.js?v=#{v}",
      "controllers/bulk_select_controller" => "/js/controllers/bulk_select_controller.js?v=#{v}",
      "trix" => "/js/trix.js?v=#{v}",
      "@rails/actiontext" => "/js/actiontext.esm.js?v=#{v}"
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
