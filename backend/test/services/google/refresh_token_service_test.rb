require "test_helper"

class Google::RefreshTokenServiceTest < ActiveSupport::TestCase
  test "updates access token when refresh succeeds" do
    user = User.create!(email: unique_email("refresh-token"), password: "password-123")
    account = user.connected_accounts.create!(
      provider: "google",
      access_token: "old-access-token",
      refresh_token: "refresh-token",
      expires_at: 1.hour.ago
    )

    response = Struct.new(:success?, :body, :status).new(
      true,
      { access_token: "new-access-token", expires_in: 3600 }.to_json,
      200
    )

    with_stubbed_module_method(Faraday, :post, -> { response }) do
      Google::RefreshTokenService.new(account).call
    end

    assert_equal "new-access-token", account.reload.access_token
    assert account.expires_at > Time.current
  end

  test "raises and keeps existing token when refresh fails" do
    user = User.create!(email: unique_email("refresh-failure"), password: "password-123")
    account = user.connected_accounts.create!(
      provider: "google",
      access_token: "still-valid-token",
      refresh_token: "refresh-token",
      expires_at: 1.hour.ago
    )

    response = Struct.new(:success?, :body, :status).new(
      false,
      { error: "invalid_grant" }.to_json,
      401
    )

    error = assert_raises(RuntimeError) do
      with_stubbed_module_method(Faraday, :post, -> { response }) do
        Google::RefreshTokenService.new(account).call
      end
    end

    assert_equal "Token refresh failed", error.message
    assert_equal "still-valid-token", account.reload.access_token
  end
end
