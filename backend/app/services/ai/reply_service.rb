module Ai
  class ReplyService
    def initialize(email, tone: "professional")
      @email = email
      @tone = tone
      @provider = Ai::ProviderFactory.build
    end

    def call
      prompt = build_prompt

      response = @provider.chat(prompt)

      response.strip
    rescue => e
      Rails.logger.error("Reply generation failed for #{@email.id}: #{e.message}")
      nil
    end

    private

    def build_prompt
      <<~PROMPT
        Write a reply to the following email.

        Tone: #{tone_instruction}

        Subject: #{@email.subject}
        Body: #{@email.body}
      PROMPT
    end

    def tone_instruction
      case @tone
      when "casual"
        "Friendly, relaxed, conversational"
      when "professional"
        "Formal, polite, business appropriate"
      when "short"
        "Very concise, 2-3 lines max"
      when "detailed"
        "Thorough, well-explained, structured"
      else
        "Professional"
      end
    end
  end
end