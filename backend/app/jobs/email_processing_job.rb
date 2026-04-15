class EmailProcessingJob < ApplicationJob
  queue_as :default

  def perform(user_id, email_id)
    puts "Processing email ID: #{email_id}"

    user = User.find_by(id: user_id)
    return unless user
    email = Email.find_by(id: email_id)
    return unless email

    return unless should_process?(email) # avoid reprocessing

    # 1. Classification
    result = Ai::ClassificationService.new(email).call

    puts "Classification result for email ID #{email_id}: #{result.inspect}"

    return unless result

    insight = EmailInsight.create!(
      email: email,
      category: result["category"],
      confidence: result["confidence"],
      reasoning: result["reasoning"]
    )

    # 2. Priority
    priority = Ai::PriorityScoringService.new(email, insight).call

    if priority
      insight.update!(
        priority_score: priority[:score],
        priority_reason: priority[:reason]
      )
    end

    #return if insight.priority_score < 50

    # 🔥 3. Summarization
    summary = Ai::SummarizationService.new(email).call

    puts "Summarization result for email ID #{email_id}: #{summary.inspect}"

    if summary
      insight.update!(
        summary: summary
        #key_points: summary["key_points"].join("\n")
      )
    end

    # 🔥 4. Task Extraction
    tasks_data = Ai::TaskExtractionService.new(email).call

    puts "Task extraction result for email ID #{email_id}: #{tasks_data.inspect}"

    if tasks_data && tasks_data["tasks"].present?
      tasks_data["tasks"].each do |task|
        next if task["title"].blank?

        email.tasks.create!(
          title: task["title"],
          due_date: task["due_date"],
          priority: task["priority"] || "medium",
          status: "pending"
        )
      end
    end

    # 🔥 Step 4: Apply Rules (AFTER AI)
    RuleEngineService.new(email, user).apply!
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
