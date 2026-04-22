module EmailProviders
  class BaseService
    def initialize(user, account)
      @user = user
      @account = account
    end

    # MUST be implemented by providers
    def fetch_emails
      raise NotImplementedError
    end

    protected

    def create_email(attrs)
      return if Email.exists?(external_id: attrs[:external_id], provider: @account.provider)

      email = Email.create!(
        user: @user,
        subject: attrs[:subject],
        sender: attrs[:sender],
        body: attrs[:body] || "",
        external_id: attrs[:external_id],
        received_at: attrs[:received_at] || Time.current,
        provider: @account.provider
      )

      EmailProcessingJob.perform_later(@user.id, email.id)
    end
  end
end
