module Ai
  class PriorityScoringService
    CATEGORY_WEIGHTS = {
      "important" => 80,
      "action_required" => 90,
      "promotion" => 20,
      "social" => 30,
      "spam" => 0
    }

    def initialize(email, insight)
      @email = email
      @insight = insight
    end

    def call
      score = base_score
      score += heuristic_boost
      score -= time_decay

      score = normalize(score)

      {
        score: score,
        reason: build_reason(score)
      }
    end

    private

    def base_score
      CATEGORY_WEIGHTS[@insight.category] || 50
    end

    def heuristic_boost
      boost = 0

      subject = @email.subject.to_s.downcase
      sender  = @email.sender.to_s.downcase

      boost += 25 if subject.include?("urgent")
      boost += 15 if subject.include?("meeting")
      boost += 10 if subject.include?("?")
      boost += 20 if sender.include?("boss")

      boost
    end

    def time_decay
      return 0 unless @email.received_at

      hours_old = ((Time.current - @email.received_at) / 1.hour).to_i
      hours_old * 2
    end

    def normalize(score)
      [[score, 0].max, 100].min
    end

    def build_reason(score)
      case score
      when 80..100
        "High priority"
      when 50..79
        "Medium priority"
      else
        "Low priority"
      end
    end
  end
end