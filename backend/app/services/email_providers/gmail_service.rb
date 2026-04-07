require 'faraday'
require 'json'

module EmailProviders
  class GmailService < BaseService
    BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages"

    def fetch_emails
      puts("Fetching emails for account with Gmail: #{@account.id}")
      messages = list_messages

      messages.each do |msg|
        process_message(msg["id"])
      end
    end

    private

    def list_messages
      res = safe_get(BASE_URL)
      return [] if res.nil? || !res.success?

      JSON.parse(res.body)["messages"] || []
    end

    def process_message(message_id)
      url = "#{BASE_URL}/#{message_id}"
      res = safe_get(url)

      return if res.nil? || !res.success?

      data = JSON.parse(res.body)
      headers = data.dig("payload", "headers") || []

      create_email(
        external_id: message_id,
        subject: find_header(headers, "Subject"),
        sender: find_header(headers, "From"),
        body: "",
        received_at: Time.current
      )
    end

    # ---------- TOKEN HANDLING ----------
    def ensure_valid_token!
      if @account.expired?
        Google::RefreshTokenService.new(@account).call
      end
    end

    def safe_get(url)
      ensure_valid_token!

      response = connection.get(url)

      if response.status == 401
        Google::RefreshTokenService.new(@account).call
        response = connection.get(url)
      end

      response
    rescue => e
      Rails.logger.error("Gmail error: #{e.message}")
      nil
    end

    def connection
      Faraday.new(headers: {
        "Authorization" => "Bearer #{@account.access_token}"
      })
    end

    def find_header(headers, key)
      header = headers.find { |h| h["name"] == key }
      header ? header["value"] : ""
    end
  end
end