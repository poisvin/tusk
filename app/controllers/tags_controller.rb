class TagsController < ApplicationController
  before_action :set_tag, only: [:edit, :update, :destroy]

  def index
    @tags = Tag.all.order(:name)
  end

  def create
    @tag = Tag.new(tag_params)

    respond_to do |format|
      if @tag.save
        format.html { redirect_to settings_path, notice: "Tag created successfully." }
        format.turbo_stream { redirect_to settings_path }
      else
        format.html { redirect_to settings_path, alert: @tag.errors.full_messages.first }
        format.turbo_stream { redirect_to settings_path }
      end
    end
  end

  def edit
    render layout: false if request.headers["Turbo-Frame"].present?
  end

  def update
    respond_to do |format|
      if @tag.update(tag_params)
        format.html { redirect_to settings_path, notice: "Tag updated successfully." }
        format.turbo_stream { redirect_to settings_path }
      else
        format.html { redirect_to settings_path, alert: @tag.errors.full_messages.first }
        format.turbo_stream { redirect_to settings_path }
      end
    end
  end

  def destroy
    @tag.destroy

    respond_to do |format|
      format.html { redirect_to settings_path, notice: "Tag deleted successfully." }
      format.turbo_stream { redirect_to settings_path }
    end
  end

  private

  def set_tag
    @tag = Tag.find(params[:id])
  end

  def tag_params
    params.require(:tag).permit(:name, :color)
  end
end
