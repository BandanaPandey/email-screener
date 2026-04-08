class CreateEmailInsights < ActiveRecord::Migration[8.1]
  def change
    create_table :email_insights do |t|
      t.references :email, null: false, foreign_key: true
      t.string :category
      t.float :confidence
      t.text :reasoning

      t.timestamps
    end
  end
end
