class SessionsController < ApplicationController
  def show
    if current_user.present?
      render json: {
        authenticated: true,
        user: {
          id: current_user.id,
          email: current_user.email
        }
      }
    else
      render json: { authenticated: false }, status: :unauthorized
    end
  end
end
