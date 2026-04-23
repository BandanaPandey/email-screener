module Google
  class RefreshTokenService
    TOKEN_URL = "https://oauth2.googleapis.com/token"

    def initialize(account)
      @account = account
    end

    def call
      if @account.refresh_token.blank?
        Rails.logger.error("Token refresh skipped for account_id=#{@account.id}: missing refresh token")
        raise "Token refresh failed"
      end

      Rails.logger.info("Refreshing Google token for account_id=#{@account.id}")
      response = Faraday.post(TOKEN_URL, {
        client_id: ENV['GOOGLE_CLIENT_ID'],
        client_secret: ENV['GOOGLE_CLIENT_SECRET'],
        refresh_token: @account.refresh_token,
        grant_type: 'refresh_token'
      })

      body = JSON.parse(response.body)

      if response.success? && body["access_token"]
        @account.update!(
          access_token: body["access_token"],
          expires_at: Time.current + body["expires_in"].to_i.seconds
        )
      else
        Rails.logger.error(
          "Token refresh failed for account_id=#{@account.id}: status=#{response.status} error=#{body['error'] || 'unknown'}"
        )
        raise "Token refresh failed"
      end
    rescue JSON::ParserError => e
      Rails.logger.error("Token refresh parse failed for account_id=#{@account.id}: #{e.message}")
      raise "Token refresh failed"
    end
  end
end
