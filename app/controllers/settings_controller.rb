class SettingsController < ApplicationController
  def show
    @tags = Tag.all.order(:name)
  end

  def update
    # Placeholder for future settings
    redirect_to settings_path, notice: "Settings updated"
  end
end
