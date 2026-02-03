class CreateTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :tasks do |t|
      t.string :title
      t.text :description
      t.date :scheduled_date
      t.time :start_time
      t.time :end_time
      t.integer :status
      t.integer :priority
      t.integer :category
      t.integer :recurrence
      t.boolean :remind
      t.boolean :carried_over
      t.date :original_date

      t.timestamps
    end
  end
end
