class EmailProcessingJob < ApplicationJob
  queue_as :default

  def perform(email_id)
    puts "Processing email ID: #{email_id}"
    email = Email.find_by(id: email_id)
    return unless email

    return unless should_process?(email) # avoid reprocessing

    result = Ai::ClassificationService.new(email).call

    puts "Classification result for email ID #{email_id}: #{result.inspect}"

    return unless result

    insight = EmailInsight.create!(
      email: email,
      category: result["category"],
      confidence: result["confidence"],
      reasoning: result["reasoning"]
    )

    # 🔥 Priority scoring
    priority = Ai::PriorityScoringService.new(email, insight).call

    insight.update!(
      priority_score: priority[:score],
      priority_reason: priority[:reason]
    )
  rescue => e
    Rails.logger.error("EmailProcessingJob failed: #{e.message}")
  end

  private

  def should_process?(email)
    return false if email.email_insight.present?

    return false if email.subject.blank?

    # Skip promotions early
    return false if email.sender&.include?("noreply")
    return false if email.sender&.include?("newsletter")

    # Skip very old emails
    return false if email.received_at < 7.days.ago

    true
  end
end
