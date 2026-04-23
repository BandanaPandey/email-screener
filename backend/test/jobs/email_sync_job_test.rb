require "test_helper"

class EmailSyncJobTest < ActiveJob::TestCase
  ProviderDouble = Struct.new(:calls) do
    def fetch_emails
      calls << :fetch_emails
    end
  end

  test "returns cleanly when user does not exist" do
    assert_nothing_raised do
      EmailSyncJob.perform_now(-1)
    end
  end

  test "builds gmail provider and fetches emails for one account" do
    user = User.create!(email: unique_email("sync-job"), password: "password-123")
    account = user.connected_accounts.create!(
      provider: "google",
      access_token: "token",
      refresh_token: "refresh",
      expires_at: 1.hour.from_now
    )
    provider = ProviderDouble.new([])

    with_stubbed_module_method(EmailProviders::ProviderFactory, :build, ->(*_args) { provider }) do
      EmailSyncJob.perform_now(user.id)
    end

    assert_equal [:fetch_emails], provider.calls
    assert_equal [account], user.connected_accounts.to_a
  end

  test "processes multiple google accounts" do
    user = User.create!(email: unique_email("sync-multi"), password: "password-123")
    account_one = user.connected_accounts.create!(
      provider: "google",
      access_token: "token-1",
      refresh_token: "refresh-1",
      expires_at: 1.hour.from_now
    )
    account_two = user.connected_accounts.create!(
      provider: "google",
      access_token: "token-2",
      refresh_token: "refresh-2",
      expires_at: 1.hour.from_now
    )

    factory_calls = []
    providers = Hash.new { |hash, key| hash[key] = ProviderDouble.new([]) }

    with_stubbed_module_method(EmailProviders::ProviderFactory, :build, lambda { |passed_user, account|
      factory_calls << [passed_user.id, account.id]
      providers[account.id]
    }) do
      EmailSyncJob.perform_now(user.id)
    end

    assert_equal [[user.id, account_one.id], [user.id, account_two.id]], factory_calls
    assert_equal [:fetch_emails], providers[account_one.id].calls
    assert_equal [:fetch_emails], providers[account_two.id].calls
  end

  test "swallows provider factory errors" do
    user = User.create!(email: unique_email("sync-error"), password: "password-123")
    user.connected_accounts.create!(
      provider: "google",
      access_token: "token",
      refresh_token: "refresh",
      expires_at: 1.hour.from_now
    )

    with_stubbed_module_method(EmailProviders::ProviderFactory, :build, ->(*_args) { raise "provider failed" }) do
      assert_nothing_raised do
        EmailSyncJob.perform_now(user.id)
      end
    end
  end

  test "swallows provider service errors" do
    user = User.create!(email: unique_email("sync-service-error"), password: "password-123")
    user.connected_accounts.create!(
      provider: "google",
      access_token: "token",
      refresh_token: "refresh",
      expires_at: 1.hour.from_now
    )

    provider = Object.new
    provider.define_singleton_method(:fetch_emails) { raise "gmail request failed" }

    with_stubbed_module_method(EmailProviders::ProviderFactory, :build, ->(*_args) { provider }) do
      assert_nothing_raised do
        EmailSyncJob.perform_now(user.id)
      end
    end
  end
end
