class ApplicationController < ActionController::Base
  layout :detect_layout

  private

  def detect_layout
    # Skip for API controllers or Turbo Frame requests
    return false if request.headers["Accept"]&.include?("application/json")
    return false if request.headers["Turbo-Frame"].present?

    # Use cookie set by JavaScript to determine layout
    if cookies[:viewport] == "desktop"
      "desktop"
    else
      "mobile"
    end
  end

  def desktop?
    cookies[:viewport] == "desktop"
  end
  helper_method :desktop?

  def mobile?
    cookies[:viewport] != "desktop"
  end
  helper_method :mobile?
end
