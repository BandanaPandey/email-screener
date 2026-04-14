class EmailsController < ApplicationController
  before_action :authenticate_user!
  
  def index
    emails = current_user.emails.includes(:email_insight).order(received_at: :desc).limit(50)

    render json: emails.as_json(include: [:email_insight, :tasks])
  end

  def sync
    #EmailSyncJob.perform_later(current_user.id)
    EmailSyncJob.perform_now(current_user.id) # For testing, remove in production
    render json: { message: "Email sync started in background" }
  end
end