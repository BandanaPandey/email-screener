class CreateRules < ActiveRecord::Migration[8.1]
  def change
    create_table :rules do |t|
      t.references :user, null: false, foreign_key: true
      t.string :field
      t.string :operator
      t.string :value
      t.string :action

      t.timestamps
    end
  end
end
