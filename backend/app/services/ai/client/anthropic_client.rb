module Ai
  module Client
    class AnthropicClient < BaseClient
      API_URL = "https://api.anthropic.com/v1/messages"

      def chat(prompt)
        response = Faraday.post(API_URL) do |req|
          req.headers['x-api-key'] = ENV['ANTHROPIC_API_KEY']
          req.headers['Content-Type'] = 'application/json'
          req.headers['anthropic-version'] = '2023-06-01'

          req.body = {
            model: "claude-3-haiku-20240307",
            max_tokens: 300,
            messages: [
              { role: "user", content: prompt }
            ]
          }.to_json
        end

        body = JSON.parse(response.body)
        body.dig("content", 0, "text")
      end
    end
  end
end