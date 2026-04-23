require "test_helper"

class EmailInsightTest < ActiveSupport::TestCase
  test "email_id is unique" do
    user = User.create!(email: unique_email("insight-model"), password: "password-123")
    email = user.emails.create!(
      provider: "google",
      external_id: SecureRandom.uuid,
      subject: "Weekly update",
      sender: "team@example.com",
      body: "Summary",
      received_at: Time.current
    )
    email.create_email_insight!(category: "general", confidence: 0.7)

    duplicate_insight = EmailInsight.new(email: email, category: "general", confidence: 0.8)

    assert_not duplicate_insight.valid?
    assert_includes duplicate_insight.errors[:email_id], "has already been taken"
  end
end
