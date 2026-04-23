module Ai
  module Client
    class OllamaClient < BaseClient
      def chat(prompt)
        response = Faraday.post("http://localhost:11434/api/generate") do |req|
          req.headers['Content-Type'] = 'application/json'

          req.body = {
            model: "llama3",
            prompt: prompt,
            stream: false
          }.to_json
        end

        body = JSON.parse(response.body)
        body["response"]
      rescue JSON::ParserError => e
        Rails.logger.error("Ollama response parse failed: #{e.message}")
        nil
      end
    end
  end
end
