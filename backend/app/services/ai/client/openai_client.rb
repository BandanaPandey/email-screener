require 'faraday'
require 'json'

module Ai
  module Client
    class OpenaiClient < BaseClient
      API_URL = "https://api.openai.com/v1/chat/completions"

      def chat(prompt)
        response = Faraday.post(API_URL) do |req|
          req.headers['Authorization'] = "Bearer #{ENV['OPENAI_API_KEY']}"
          req.headers['Content-Type'] = 'application/json'

          req.body = {
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are an email classification assistant." },
              { role: "user", content: prompt }
            ],
            temperature: 0.2
          }.to_json
        end

        body = JSON.parse(response.body)
        body.dig("choices", 0, "message", "content")
      end
    end
  end
end