class AddSummaryToEmailInsights < ActiveRecord::Migration[8.1]
  def change
    add_column :email_insights, :summary, :text
    add_column :email_insights, :key_points, :text
  end
end
