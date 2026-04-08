module Ai
  class ClassificationService
    def initialize(email)
      @email = email
      @client = ProviderFactory.build
    end

    def call
      prompt = build_prompt

      raw_response = @client.chat(prompt)

      parse_response(raw_response)
    rescue => e
      puts("AI Classification failed: #{e.message}")
      Rails.logger.error("AI Classification failed: #{e.message}")
      nil
    end

    private

    def build_prompt
      <<~PROMPT
      Classify the following email into one of these categories:
      - important
      - action_required
      - promotion
      - social
      - spam

      Return the response in JSON ONLY:
      {
        "category": "...",
        "confidence": 0.0-1.0,
        "reasoning": "..."
      }

      Email:
      Subject: #{@email.subject}
      From: #{@email.sender}
      Body: #{@email.body}
      PROMPT

      # cleaned_body = truncate_body(clean_body(@email.body))

      # <<~PROMPT
      # Classify email into one category:
      # important | action_required | promotion | social | spam

      # Return JSON:
      # {"category":"...", "confidence":0-1}

      # Subject: #{@email.subject}
      # From: #{@email.sender}
      # Body: #{@email.body}
      # PROMPT
    end

    def parse_response(content)
      JSON.parse(content)
    rescue => e
      puts("Failed to parse AI response: #{e.message}")
      nil
    end

    def truncate_body(text, max_chars = 1000)
      return "" unless text

      text.gsub(/\s+/, " ")[0...max_chars]
    end

    def clean_body(text)
      return "" unless text

      text
        .gsub(/http\S+/, '')      # remove links
        .gsub(/\s+/, ' ')         # normalize spaces
        .strip
    end
  end
end