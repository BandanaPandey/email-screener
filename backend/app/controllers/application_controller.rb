class ApplicationController < ActionController::API
  include ActionController::Cookies

  before_action :set_current_user

  private

  def set_current_user
    # 🔐 Option 1: Session-based (OmniAuth / Google login)
    if session[:user_id]
      @current_user = User.find_by(id: session[:user_id])
      puts "Current user set from session: #{@current_user.inspect}"
    end
  end

  def current_user
    @current_user
  end

  def authenticate_user!
    return if current_user.present?

    render json: { error: "Unauthorized" }, status: :unauthorized
  end
end