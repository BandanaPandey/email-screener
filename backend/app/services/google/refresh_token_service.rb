module Google
  class RefreshTokenService
    TOKEN_URL = "https://oauth2.googleapis.com/token"

    def initialize(account)
      @account = account
    end

    def call
      puts("Refreshing token for account: #{@account.id}")
      response = Faraday.post(TOKEN_URL, {
        client_id: ENV['GOOGLE_CLIENT_ID'],
        client_secret: ENV['GOOGLE_CLIENT_SECRET'],
        refresh_token: @account.refresh_token,
        grant_type: 'refresh_token'
      })

      body = JSON.parse(response.body)

      if body["access_token"]
        @account.update!(
          access_token: body["access_token"],
          expires_at: Time.current + body["expires_in"].to_i.seconds
        )
      else
        Rails.logger.error("Token refresh failed: #{body}")
        raise "Token refresh failed"
      end
    end
  end
end