module Ai
  class TaskExtractionService
    def initialize(email)
      @email = email
      @client = ProviderFactory.build
    end

    def call
      prompt = build_prompt
      raw = @client.chat(prompt)

      #parse_response(raw)
      parse_ai_response(raw)
    rescue => e
      Rails.logger.error("Task extraction failed: #{e.message}")
      nil
    end

    private

    def build_prompt
      <<~PROMPT
      Extract actionable tasks from this email.

      Return JSON:
      {
        "tasks": [
          {
            "title": "short task",
            "due_date": "YYYY-MM-DD or null",
            "priority": "low|medium|high"
          }
        ]
      }

      If no tasks, return:
      { "tasks": [] }

      Email:
      Subject: #{@email.subject}
      Body: #{truncate_body(clean_body(@email.body))}
      PROMPT
    end

    def parse_ai_response(raw_response)
      return nil if raw_response.blank?

      # 🔥 Extract JSON block using regex
      json_match = raw_response.match(/\{.*\}/m)

      unless json_match
        Rails.logger.error("No JSON found in AI response: #{raw_response}")
        return nil
      end

      json_string = json_match[0]

      begin
        JSON.parse(json_string)
      rescue JSON::ParserError => e
        Rails.logger.error("JSON parse failed: #{e.message}")
        Rails.logger.error("Raw JSON string: #{json_string}")
        nil
      end
    end

    def parse_response(content)
      JSON.parse(content)
    rescue
      nil
    end

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