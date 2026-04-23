class AddUniquenessConstraintsForEmailSync < ActiveRecord::Migration[8.1]
  def change
    add_index :emails, [:user_id, :provider, :external_id], unique: true, if_not_exists: true
    remove_index :email_insights, :email_id, if_exists: true
    add_index :email_insights, :email_id, unique: true
  end
end
