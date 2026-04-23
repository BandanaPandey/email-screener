require "test_helper"

class AuthFlowTest < ActionDispatch::IntegrationTest
  setup do
    OmniAuth.config.test_mode = true
  end

  teardown do
    OmniAuth.config.mock_auth[:google_oauth2] = nil
  end

  test "google callback creates user account and stores connected account" do
    email = unique_email("auth")
    OmniAuth.config.mock_auth[:google_oauth2] = build_google_auth_hash(
      email: email,
      token: "new-access-token",
      refresh_token: "new-refresh-token"
    )

    assert_difference -> { User.count }, 1 do
      assert_difference -> { ConnectedAccount.count }, 1 do
        get "/auth/google_oauth2/callback"
      end
    end

    assert_response :redirect

    user = User.find_by!(email: email)
    account = user.connected_accounts.find_by!(provider: "google")

    assert_equal "new-access-token", account.access_token
    assert_equal "new-refresh-token", account.refresh_token
  end

  test "session endpoint returns unauthorized when logged out" do
    get "/session"

    assert_response :unauthorized
    assert_equal({ "authenticated" => false }, JSON.parse(response.body))
  end

  test "session endpoint returns authenticated user after google login" do
    user = sign_in_with_google(email: unique_email("session"))

    get "/session"

    assert_response :success
    assert_equal(
      {
        "authenticated" => true,
        "user" => {
          "id" => user.id,
          "email" => user.email
        }
      },
      JSON.parse(response.body)
    )
  end
end
