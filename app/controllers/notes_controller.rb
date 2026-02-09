class NotesController < ApplicationController
  before_action :set_note, only: [:show, :edit, :update, :destroy]
  before_action :set_tags, only: [:new, :edit, :create, :update]

  def index
    @notes = Note.includes(:tags)
    @notes = @notes.where(category: params[:category]) if params[:category].present?
    @notes = @notes.order(updated_at: :desc)
    @search_query = params[:q]

    if @search_query.present?
      @notes = @notes.where("title ILIKE :q OR content ILIKE :q", q: "%#{@search_query}%")
    end
  end

  def show
    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  def new
    @note = Note.new(category: params[:category] || :personal)
    render_modal
  end

  def edit
    render_modal
  end

  def create
    @note = Note.new(note_params)

    respond_to do |format|
      if @note.save
        format.html { redirect_to notes_path, notice: "Note created successfully." }
        format.turbo_stream { redirect_to notes_path, notice: "Note created successfully." }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.turbo_stream { render :new, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @note.update(note_params)
        format.html { redirect_to notes_path, notice: "Note updated successfully." }
        format.turbo_stream { redirect_to notes_path, notice: "Note updated successfully." }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.turbo_stream { render :edit, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @note.destroy

    respond_to do |format|
      format.html { redirect_to notes_path, notice: "Note deleted successfully." }
      format.turbo_stream { redirect_to notes_path, notice: "Note deleted successfully." }
    end
  end

  private

  def set_note
    @note = Note.includes(:tags).find(params[:id])
  end

  def set_tags
    @tags = Tag.all.order(:name)
  end

  def note_params
    params.require(:note).permit(:title, :content, :category, tag_ids: [])
  end

  def render_modal
    render layout: false if turbo_frame_request?
  end
end
