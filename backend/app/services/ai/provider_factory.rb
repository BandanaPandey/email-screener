module Ai
  class ProviderFactory
    def self.build
      provider = ENV.fetch("AI_PROVIDER", "openai")

      puts("Building AI client for provider: #{provider}")

      case provider
      when "openai"
        Client::OpenaiClient.new

      when "ollama"
        Client::OllamaClient.new

      when "anthropic"
        Client::AnthropicClient.new

      else
        raise "Unsupported AI provider: #{provider}"
      end
    end
  end
end