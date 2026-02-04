class CreateJoinTableNotesTasks < ActiveRecord::Migration[7.1]
  def change
    create_join_table :notes, :tasks do |t|
      t.index [:note_id, :task_id], unique: true
      t.index [:task_id, :note_id]
    end
  end
end
