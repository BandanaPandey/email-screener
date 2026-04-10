module Ai
  class SummarizationService
    def initialize(email)
      @email = email
      @client = ProviderFactory.build
    end

    def call
      prompt = build_prompt
      raw = @client.chat(prompt)

      parse_summary_response(raw)
    rescue => e
      Rails.logger.error("Summarization failed: #{e.message}")
      nil
    end

    private

    def build_prompt
      <<~PROMPT
      Summarize this email.

      Return concise summary:

      Email:
      Subject: #{@email.subject}
      From: #{@email.sender}
      Body: #{truncate_body(clean_body(@email.body))}
      PROMPT
    end
    
    def parse_summary_response(raw_response)
      return nil if raw_response.blank?

      # If JSON exists → extract
      json_match = raw_response.match(/\{.*\}/m)

      if json_match
        begin
          parsed = JSON.parse(json_match[0])
          return parsed["summary"]
        rescue JSON::ParserError
          # fallback to plain text
        end
      end

      # ✅ Fallback: treat entire response as summary
      raw_response.strip
    end

    # 🔥 reuse your optimizations
    def truncate_body(text, max_chars = 800)
      return "" unless text
      text.gsub(/\s+/, " ")[0...max_chars]
    end

    def clean_body(text)
      return "" unless text
      text.gsub(/http\S+/, '').strip
    end
  end
end