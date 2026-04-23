module EmailProviders
  class ProviderFactory
    def self.build(user, account)
      return GmailService.new(user, account) if account.provider == "google"

      raise "Unsupported provider for v1: #{account.provider}"
    end
  end
end
