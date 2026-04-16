module Ai
  class ReplyService
    def initialize(email)
      @email = email
      @provider = Ai::ProviderFactory.build
    end

    def call
      prompt = <<~PROMPT
        Write a professional reply to this email:

        Subject: #{@email.subject}
        Body: #{@email.body}
      PROMPT

      response = @provider.chat(prompt)

      response.strip
    rescue => e
      Rails.logger.error("Reply generation failed for #{@email.id}: #{e.message}")
      nil
    end
  end
end