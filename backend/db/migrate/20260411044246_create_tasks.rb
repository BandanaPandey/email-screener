class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.references :email, null: false, foreign_key: true
      t.string :title
      t.datetime :due_date
      t.string :priority
      t.string :status

      t.timestamps
    end
  end
end
