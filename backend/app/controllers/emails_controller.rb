class EmailsController < ApplicationController
  before_action :authenticate_user!
  
  def index
    emails = current_user.emails.includes(:email_insight).order(received_at: :desc).limit(50)

    render json: emails.as_json(include: [:email_insight, :tasks])
  end

  def sync
    EmailSyncJob.perform_later(current_user.id)
    render json: { message: "Email sync queued" }, status: :accepted
  end
end
