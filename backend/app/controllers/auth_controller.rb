class AuthController < ApplicationController
  def google
    auth = request.env['omniauth.auth']
    puts "Received auth callback: #{auth.inspect}"

    user = User.find_by(email: auth.info.email)

    if user.nil?
      user = User.new(
        email: auth.info.email,
        password: Devise.friendly_token[0, 20] # dummy password
      )
      user.save!
    end

    session[:user_id] = user.id   # ✅ THIS IS CRITICAL

    account = user.connected_accounts.find_or_initialize_by(provider: 'google')

    account.update!(
      access_token: auth.credentials.token,
      refresh_token: auth.credentials.refresh_token,
      expires_at: Time.at(auth.credentials.expires_at)
    )

    redirect_to "http://localhost:3001/dashboard"
  end
end