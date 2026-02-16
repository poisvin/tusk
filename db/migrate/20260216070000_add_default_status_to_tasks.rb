class AddDefaultStatusToTasks < ActiveRecord::Migration[7.1]
  def up
    change_column_default :tasks, :status, 0
    Task.where(status: nil).update_all(status: 0)
  end

  def down
    change_column_default :tasks, :status, nil
  end
end
