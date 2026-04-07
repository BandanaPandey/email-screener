class AddFieldsToConnectedAccounts < ActiveRecord::Migration[8.1]
  def change
    add_column :connected_accounts, :uid, :string
  end
end
