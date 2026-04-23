class EmailProcessingJob < ApplicationJob
  queue_as :default

  def perform(user_id, email_id)
    user = User.find_by(id: user_id)
    return unless user
    email = Email.find_by(id: email_id)
    return unless email

    return unless should_process?(email)

    result = Ai::ClassificationService.new(email).call
    return unless result

    insight = EmailInsight.find_or_initialize_by(email: email)
    insight.assign_attributes(
      category: result["category"],
      confidence: result["confidence"],
      reasoning: result["reasoning"]
    )
    insight.save! if insight.new_record? || insight.changed?

    priority = Ai::PriorityScoringService.new(email, insight).call

    if priority
      insight.update!(
        priority_score: priority[:score],
        priority_reason: priority[:reason]
      )
    end

    summary = Ai::SummarizationService.new(email).call

    if summary
      insight.update!(
        summary: summary
      )
    end

    tasks_data = Ai::TaskExtractionService.new(email).call

    extracted_tasks = tasks_data.is_a?(Hash) ? tasks_data["tasks"] || tasks_data[:tasks] || [] : []

    if extracted_tasks.present?
      extracted_tasks.each do |task|
        next if task["title"].blank?

        email_task = email.tasks.find_or_initialize_by(
          title: task["title"],
          due_date: task["due_date"]
        )

        email_task.priority = task["priority"] || "medium"
        email_task.status = "pending" if email_task.status.blank?
        email_task.save! if email_task.new_record? || email_task.changed?
      end
    end

    RuleEngineService.new(email, user).apply!
  rescue => e
    Rails.logger.error("EmailProcessingJob failed: #{e.message}")
  end

  private

  def should_process?(email)
    return false if email.subject.blank?

    return false if email.sender&.include?("noreply")
    return false if email.sender&.include?("newsletter")

    return false if email.received_at < 7.days.ago

    true
  end
end
