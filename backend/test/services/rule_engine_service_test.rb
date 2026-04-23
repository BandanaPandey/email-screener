require "test_helper"

class RuleEngineServiceTest < ActiveSupport::TestCase
  test "mark_important promotes priority score to 100 for matching sender rule" do
    user = User.create!(email: unique_email("rule-engine"), password: "password-123")
    email = user.emails.create!(
      provider: "google",
      external_id: SecureRandom.uuid,
      subject: "Status update",
      sender: "vip@example.com",
      body: "Please review",
      received_at: Time.current
    )
    user.rules.create!(field: "sender", operator: "contains", value: "vip@", action: "mark_important")

    RuleEngineService.new(email, user).apply!

    assert_equal 100, email.reload.email_insight.priority_score
  end

  test "mark_promotion categorizes matching email as promotion" do
    user = User.create!(email: unique_email("rule-engine-promo"), password: "password-123")
    email = user.emails.create!(
      provider: "google",
      external_id: SecureRandom.uuid,
      subject: "Savings inside",
      sender: "promo@example.com",
      body: "unsubscribe at any time",
      received_at: Time.current
    )
    user.rules.create!(field: "body", operator: "contains", value: "unsubscribe", action: "mark_promotion")

    RuleEngineService.new(email, user).apply!

    assert_equal "promotion", email.reload.email_insight.category
  end
end
