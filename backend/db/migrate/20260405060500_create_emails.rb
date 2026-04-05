class CreateEmails < ActiveRecord::Migration[8.1]
  def change
    create_table :emails do |t|
      t.references :user, null: false, foreign_key: true
      t.string :subject
      t.string :sender
      t.text :body
      t.datetime :received_at
      t.string :external_id

      t.timestamps
    end
  end
end
