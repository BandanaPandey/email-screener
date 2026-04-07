class AddProviderToEmails < ActiveRecord::Migration[8.1]
  def change
    add_column :emails, :provider, :string
  end
end
