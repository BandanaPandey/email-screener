ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "omniauth"

module ActiveSupport
  class TestCase
    parallelize(workers: :number_of_processors)

    include ActiveJob::TestHelper

    setup do
      ActiveJob::Base.queue_adapter = :test
      clear_enqueued_jobs
      clear_performed_jobs
    end

    teardown do
      clear_enqueued_jobs
      clear_performed_jobs
    end

    def unique_email(prefix = "user")
      "#{prefix}-#{SecureRandom.hex(6)}@example.com"
    end

    def build_google_auth_hash(email:, token: "access-token", refresh_token: "refresh-token", expires_at: 2.hours.from_now.to_i)
      OmniAuth::AuthHash.new(
        provider: "google_oauth2",
        uid: SecureRandom.uuid,
        info: {
          email: email
        },
        credentials: {
          token: token,
          refresh_token: refresh_token,
          expires_at: expires_at
        }
      )
    end

    def with_stubbed_class_constructor(klass, fake_object)
      eigenclass = class << klass; self; end
      original_new = klass.method(:new)

      eigenclass.send(:define_method, :new) do |*args, **kwargs|
        if fake_object.is_a?(Proc) || fake_object.is_a?(Method)
          fake_object.call(*args, **kwargs)
        else
          fake_object
        end
      end

      yield
    ensure
      eigenclass.send(:define_method, :new, original_new)
    end

    def with_stubbed_module_method(mod, method_name, fake_callable)
      eigenclass = class << mod; self; end
      original_method = mod.method(method_name)

      eigenclass.send(:define_method, method_name) do |*args, **kwargs|
        fake_callable.call(*args, **kwargs)
      end

      yield
    ensure
      eigenclass.send(:define_method, method_name, original_method)
    end
  end
end

module AuthenticationTestHelper
  def sign_in_with_google(email: unique_email("oauth"), token: "access-token", refresh_token: "refresh-token")
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:google_oauth2] = build_google_auth_hash(
      email: email,
      token: token,
      refresh_token: refresh_token
    )

    get "/auth/google_oauth2/callback"
    assert_response :redirect

    User.find_by!(email: email)
  ensure
    OmniAuth.config.mock_auth[:google_oauth2] = nil
  end
end

class ActionDispatch::IntegrationTest
  include AuthenticationTestHelper
end
