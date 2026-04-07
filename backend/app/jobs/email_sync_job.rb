class EmailSyncJob < ApplicationJob
  queue_as :default

  retry_on StandardError, wait: :exponentially_longer, attempts: 5

  def perform(user_id)
    user = User.find_by(id: user_id)
    return unless user

    Rails.logger.info("Starting email sync for user #{user.id}")

    user.connected_accounts.each do |account|
      provider = EmailProviders::ProviderFactory.build(user, account)

      Rails.logger.info("Syncing #{account.provider} for user #{user.id}")

      provider.fetch_emails
    end
    Rails.logger.info("Email sync completed for user #{user.id}")
  rescue => e
    Rails.logger.error("EmailSyncJob failed: #{e.message}")
  end
end