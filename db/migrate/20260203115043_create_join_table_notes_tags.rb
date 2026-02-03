class CreateJoinTableNotesTags < ActiveRecord::Migration[7.1]
  def change
    create_join_table :notes, :tags do |t|
      # t.index [:note_id, :tag_id]
      # t.index [:tag_id, :note_id]
    end
  end
end
