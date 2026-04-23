require "test_helper"

class EmailsControllerTest < ActionDispatch::IntegrationTest
  test "index requires authentication" do
    get "/emails"

    assert_response :unauthorized
  end

  test "index returns emails ordered by received_at descending with nested records" do
    user = sign_in_with_google(email: unique_email("emails"))
    older_email = user.emails.create!(
      provider: "google",
      external_id: SecureRandom.uuid,
      subject: "Older",
      sender: "older@example.com",
      body: "Older body",
      received_at: 2.days.ago
    )
    older_email.create_email_insight!(category: "general", confidence: 0.5)
    older_email.tasks.create!(title: "Follow up later", priority: "low", status: "pending")

    newer_email = user.emails.create!(
      provider: "google",
      external_id: SecureRandom.uuid,
      subject: "Newer",
      sender: "newer@example.com",
      body: "Newer body",
      received_at: 1.day.ago
    )
    newer_email.create_email_insight!(category: "important", confidence: 0.9)

    get "/emails"

    assert_response :success

    payload = JSON.parse(response.body)
    assert_equal ["Newer", "Older"], payload.fetch("items").map { |item| item.fetch("subject") }
    assert_equal "important", payload.fetch("items").first.dig("email_insight", "category")
    assert_equal "Follow up later", payload.fetch("items").second.fetch("tasks").first.fetch("title")
  end

  test "sync enqueues email sync job for current user" do
    user = sign_in_with_google(email: unique_email("sync"))

    assert_enqueued_with(job: EmailSyncJob, args: [user.id]) do
      post "/sync_emails"
    end

    assert_response :accepted
    assert_equal({ "message" => "Email sync queued" }, JSON.parse(response.body))
  end
end
