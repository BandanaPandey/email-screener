require "test_helper"

class EmailTest < ActiveSupport::TestCase
  test "external_id is unique per user and provider" do
    user = User.create!(email: unique_email("email-model"), password: "password-123")
    user.emails.create!(
      provider: "google",
      external_id: "gmail-123",
      subject: "Hello",
      sender: "person@example.com",
      body: "Body",
      received_at: Time.current
    )

    duplicate_email = user.emails.build(
      provider: "google",
      external_id: "gmail-123",
      subject: "Duplicate",
      sender: "person@example.com",
      body: "Body",
      received_at: Time.current
    )

    assert_not duplicate_email.valid?
    assert_includes duplicate_email.errors[:external_id], "has already been taken"
  end

  test "same external_id can exist for different providers" do
    user = User.create!(email: unique_email("provider-scope"), password: "password-123")
    user.emails.create!(
      provider: "google",
      external_id: "shared-id",
      subject: "Google",
      sender: "google@example.com",
      body: "Body",
      received_at: Time.current
    )

    email = user.emails.build(
      provider: "exchange",
      external_id: "shared-id",
      subject: "Exchange",
      sender: "exchange@example.com",
      body: "Body",
      received_at: Time.current
    )

    assert email.valid?
  end
end
