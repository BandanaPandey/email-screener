require 'faraday'
require 'json'

module Gmail
  class FetchEmailsService
    BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages"

    def initialize(user)
      @user = user
      @account = user.connected_accounts.find_by(provider: 'google')

      raise "Google account not connected" unless @account
    end

    def call
      message_ids = list_messages

      message_ids.each do |msg|
        fetch_and_store(msg["id"])
      end
    end

    private

    # ==============================
    # 🔹 Fetch message list
    # ==============================
    def list_messages
      res = safe_get(BASE_URL)

      Rails.logger.info("Gmail list_messages response: #{res&.status}")

      return [] if res.nil? || !res.success?

      JSON.parse(res.body)["messages"] || []
    end

    # ==============================
    # 🔹 Fetch individual email
    # ==============================
    def fetch_and_store(message_id)
      url = "#{BASE_URL}/#{message_id}"
      res = safe_get(url)

      return if res.nil? || !res.success?

      data = JSON.parse(res.body)

      headers = data.dig("payload", "headers") || []

      subject = find_header(headers, "Subject")
      sender  = find_header(headers, "From")

      # Avoid duplicates
      return if Email.exists?(external_id: message_id)

      Email.create!(
        user: @user,
        subject: subject,
        sender: sender,
        body: "", # will enhance later
        external_id: message_id,
        received_at: Time.current
      )
    end

    # ==============================
    # 🔹 Safe API call with retry
    # ==============================
    def safe_get(url)
      ensure_valid_token!

      response = connection.get(url)
      # 🔁 Retry once if token expired mid-request
      if response.status == 401
          Rails.logger.info("Access token expired. Refreshing...")

          Gmail::RefreshTokenService.new(@account).call

          response = connection.get(url)
      end

      response
      rescue Faraday::Error => e
      Rails.logger.error("Faraday error: #{e.message}")
      nil
      rescue => e
      Rails.logger.error("Unexpected error: #{e.message}")
      nil
    end

    # ==============================
    # 🔹 Ensure token is valid
    # ==============================
    def ensure_valid_token!
      if @account.expired?
        Rails.logger.info("Refreshing expired token...")

        Gmail::RefreshTokenService.new(@account).call
      end
    end

    # ==============================
    # 🔹 Faraday connection
    # ==============================
    def connection
      Faraday.new(
        url: "https://gmail.googleapis.com",
        headers: {
          "Authorization" => "Bearer #{@account.access_token}",
          "Content-Type"  => "application/json"
        }
      )
    end

    # ==============================
    # 🔹 Extract header helper
    # ==============================
    def find_header(headers, key)
      header = headers.find { |h| h["name"] == key }
      header ? header["value"] : ""
    end
  end
end