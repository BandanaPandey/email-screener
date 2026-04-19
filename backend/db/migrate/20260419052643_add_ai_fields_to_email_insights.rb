class AddAiFieldsToEmailInsights < ActiveRecord::Migration[8.1]
  def change
    add_column :email_insights, :reply_suggestion, :text
  end
end
