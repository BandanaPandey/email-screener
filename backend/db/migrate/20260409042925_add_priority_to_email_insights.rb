class AddPriorityToEmailInsights < ActiveRecord::Migration[8.1]
  def change
    add_column :email_insights, :priority_score, :integer
    add_column :email_insights, :priority_reason, :text
  end
end
