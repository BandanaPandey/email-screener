require 'faraday'
require 'json'

module Gmail
  class FetchEmailsService
    BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages"

    def initialize(user)
      @account = user.connected_accounts.find_by(provider: 'google')
    end

    def call
      message_ids = list_messages
      message_ids.each do |msg|
        fetch_and_store(msg["id"])
      end
    end

    private

    def list_messages
      res = connection.get(BASE_URL)
      JSON.parse(res.body)["messages"] || []
    end

    def fetch_and_store(message_id)
      url = "#{BASE_URL}/#{message_id}"
      res = connection.get(url)

      data = JSON.parse(res.body)

      headers = data["payload"]["headers"]

      subject = find_header(headers, "Subject")
      sender = find_header(headers, "From")

      Email.create!(
        user: @account.user,
        subject: subject,
        sender: sender,
        body: "",
        external_id: message_id,
        received_at: Time.now
      )
    end

    def find_header(headers, key)
      header = headers.find { |h| h["name"] == key }
      header ? header["value"] : ""
    end

    def connection
      Faraday.new(headers: {
        "Authorization" => "Bearer #{@account.access_token}"
      })
    end
  end
end