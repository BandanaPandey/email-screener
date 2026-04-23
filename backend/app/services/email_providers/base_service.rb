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
      email = Email.find_or_initialize_by(
        user: @user,
        provider: @account.provider,
        external_id: attrs[:external_id]
      )

      email.assign_attributes(
        subject: attrs[:subject],
        sender: attrs[:sender],
        body: attrs[:body] || "",
        received_at: attrs[:received_at] || Time.current
      )

      is_new_record = email.new_record?
      email.save!

      EmailProcessingJob.perform_later(@user.id, email.id) if is_new_record
    rescue ActiveRecord::RecordNotUnique
      Rails.logger.info(
        "Email already exists for user=#{@user.id} provider=#{@account.provider} external_id=#{attrs[:external_id]}"
      )
    end
  end
end
