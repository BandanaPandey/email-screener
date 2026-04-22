cookie_same_site = ENV.fetch("SESSION_COOKIE_SAME_SITE", "lax").to_sym
cookie_secure = ActiveModel::Type::Boolean.new.cast(ENV.fetch("SESSION_COOKIE_SECURE", "false"))

Rails.application.config.session_store(
  :cookie_store,
  key: "_email_screener_session",
  same_site: cookie_same_site,
  secure: cookie_secure,
  httponly: true
)
