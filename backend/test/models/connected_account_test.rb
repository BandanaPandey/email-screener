require "test_helper"

class ConnectedAccountTest < ActiveSupport::TestCase
  test "expired returns true when expires_at is in the past" do
    user = User.create!(email: unique_email("account-expired"), password: "password-123")
    account = user.connected_accounts.build(provider: "google", expires_at: 5.minutes.ago)

    assert_predicate account, :expired?
  end

  test "expired returns false when expires_at is in the future" do
    user = User.create!(email: unique_email("account-valid"), password: "password-123")
    account = user.connected_accounts.build(provider: "google", expires_at: 30.minutes.from_now)

    assert_not account.expired?
  end
end
