require 'faraday'
require 'json'
include ActionView::Helpers::SanitizeHelper

module EmailProviders
  class GmailService < BaseService
    BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages"

    def fetch_emails
      puts("Fetching emails for account with ID: #{@account.id}")
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
      body = extract_body(data["payload"])

      create_email(
        external_id: message_id,
        subject: find_header(headers, "Subject"),
        sender: find_header(headers, "From"),
        body: body,
        received_at: extract_received_at(data, headers)
      )
    end

    def extract_received_at(data, headers)
      internal_date = data["internalDate"]
      return Time.zone.at(internal_date.to_f / 1000.0) if internal_date.present?

      date_header = find_header(headers, "Date")
      return Time.zone.parse(date_header) if date_header.present?

      Time.current
    rescue ArgumentError, TypeError
      Time.current
    end

    def extract_body(payload)
      return "" unless payload

      # Case 1: direct body
      if payload["body"] && payload["body"]["data"]
        return decode_body(payload["body"]["data"])
      end

      # Case 2: multipart
      if payload["parts"]
        payload["parts"].each do |part|
          if part["mimeType"] == "text/plain"
            return decode_body(part.dig("body", "data"))
          end
        end

        # fallback to HTML
        payload["parts"].each do |part|
          if part["mimeType"] == "text/html"
            html = decode_body(part.dig("body", "data"))
            return strip_html(html)
          end
        end
      end

      ""
    end

    # ---------- TOKEN HANDLING ----------
    def ensure_valid_token!
      if @account.expired?
        Google::RefreshTokenService.new(@account).call
      end
    end

    def decode_body(data)
      return "" unless data

      decoded = Base64.urlsafe_decode64(data)
      decoded.force_encoding("UTF-8")
    end

    def strip_html(html)
      ActionView::Base.full_sanitizer.sanitize(html)
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
