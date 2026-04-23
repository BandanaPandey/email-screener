module Ai
  class ClassificationService
    def initialize(email)
      @email = email
      @client = ProviderFactory.build
    end

    def call
      prompt = build_prompt

      raw_response = @client.chat(prompt)
      parse_ai_response(raw_response)
    rescue => e
      Rails.logger.error("AI Classification failed for email_id=#{@email.id}: #{e.class} #{e.message}")
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

    def parse_ai_response(raw_response)
      return nil if raw_response.blank?

      # 🔥 Extract JSON block using regex
      json_match = raw_response.match(/\{.*\}/m)

      unless json_match
        Rails.logger.error("No JSON found in AI classification response for email_id=#{@email.id}")
        return nil
      end

      json_string = json_match[0]

      begin
        JSON.parse(json_string)
      rescue JSON::ParserError => e
        Rails.logger.error("AI classification JSON parse failed for email_id=#{@email.id}: #{e.message}")
        nil
      end
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
