module EmailProviders
  class ProviderFactory
    def self.build(user, account)
      case account.provider
      when "google"
        GmailService.new(user, account)

      # future support
      when "outlook"
        OutlookService.new(user, account)

      when "imap"
        ImapService.new(user, account)

      else
        raise "Unsupported provider: #{account.provider}"
      end
    end
  end
end