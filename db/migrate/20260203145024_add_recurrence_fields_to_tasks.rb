class AddRecurrenceFieldsToTasks < ActiveRecord::Migration[7.1]
  def change
    add_column :tasks, :recurrence_parent_id, :integer
    add_column :tasks, :weekly_days, :string, array: true, default: []
    add_index :tasks, :recurrence_parent_id
  end
end
