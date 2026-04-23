require "test_helper"

class AiControllerTest < ActionDispatch::IntegrationTest
  test "reply updates insight and returns reply" do
    user = sign_in_with_google(email: unique_email("ai-reply"))
    email = user.emails.create!(
      provider: "google",
      external_id: SecureRandom.uuid,
      subject: "Follow up",
      sender: "client@example.com",
      body: "Can you reply?",
      received_at: Time.current
    )
    insight = email.create_email_insight!(category: "general", confidence: 0.5)
    reply_service = Struct.new(:response) do
      def call
        response
      end
    end.new("Thanks for the note.")

    with_stubbed_class_constructor(Ai::ReplyService, reply_service) do
      post "/ai/reply", params: { email_id: email.id, tone: "friendly" }
    end

    assert_response :success
    assert_equal "Thanks for the note.", JSON.parse(response.body).fetch("reply")
    assert_equal "Thanks for the note.", insight.reload.reply_suggestion
  end

  test "summarize updates insight and returns summary" do
    user = sign_in_with_google(email: unique_email("ai-summary"))
    email = user.emails.create!(
      provider: "google",
      external_id: SecureRandom.uuid,
      subject: "Project status",
      sender: "manager@example.com",
      body: "Here is the latest status",
      received_at: Time.current
    )
    insight = email.create_email_insight!(category: "general", confidence: 0.4)
    summary_service = Struct.new(:response) do
      def call
        response
      end
    end.new("Project is on track.")

    with_stubbed_class_constructor(Ai::SummarizationService, summary_service) do
      post "/ai/summarize", params: { email_id: email.id }
    end

    assert_response :success
    assert_equal "Project is on track.", JSON.parse(response.body).fetch("summary")
    assert_equal "Project is on track.", insight.reload.summary
  end

  test "extract tasks returns flat tasks array" do
    user = sign_in_with_google(email: unique_email("ai-tasks"))
    email = user.emails.create!(
      provider: "google",
      external_id: SecureRandom.uuid,
      subject: "Action items",
      sender: "lead@example.com",
      body: "Please finish the draft by Friday.",
      received_at: Time.current
    )
    extraction_service = Struct.new(:response) do
      def call
        response
      end
    end.new({
      "tasks" => [
        {
          "title" => "Finish the draft",
          "due_date" => "2026-04-24",
          "priority" => "high"
        }
      ]
    })

    with_stubbed_class_constructor(Ai::TaskExtractionService, extraction_service) do
      post "/ai/extract_tasks", params: { email_id: email.id }
    end

    assert_response :success
    payload = JSON.parse(response.body)
    assert_equal 1, payload.fetch("tasks").size
    assert_equal "Finish the draft", payload.fetch("tasks").first.fetch("title")
  end
end
