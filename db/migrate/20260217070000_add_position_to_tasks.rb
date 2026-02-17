class AddPositionToTasks < ActiveRecord::Migration[7.1]
  def up
    add_column :tasks, :position, :integer

    # Backfill: partition by scheduled_date, done/closed last, then by start_time
    execute <<-SQL
      WITH ranked AS (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY scheduled_date
                 ORDER BY
                   CASE WHEN status IN (3, 5) THEN 1 ELSE 0 END,
                   start_time ASC NULLS LAST,
                   created_at ASC
               ) AS pos
        FROM tasks
      )
      UPDATE tasks SET position = ranked.pos
      FROM ranked WHERE tasks.id = ranked.id;
    SQL
  end

  def down
    remove_column :tasks, :position
  end
end
