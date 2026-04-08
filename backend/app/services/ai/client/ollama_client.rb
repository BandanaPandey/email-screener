module Ai
  module Client
    class OllamaClient < BaseClient
      def chat(prompt)
        puts("Sending prompt to Ollama:\n#{prompt}")
        response = Faraday.post("http://localhost:11434/api/generate") do |req|
          req.headers['Content-Type'] = 'application/json'

          req.body = {
            model: "llama3",
            prompt: prompt,
            stream: false
          }.to_json
        end

        body = JSON.parse(response.body)
        puts("Received response from Ollama:\n#{body}")
        body["response"]
      end
    end
  end
end