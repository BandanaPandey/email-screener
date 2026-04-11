class EmailsController < ApplicationController
  before_action :set_user

  def index
    emails = @user.emails.includes(:email_insight).order(received_at: :desc).limit(50)

    render json: emails.as_json(include: [:email_insight, :tasks])
  end

  def sync
    #EmailSyncJob.perform_later(@user.id)
    EmailSyncJob.perform_now(@user.id) # For testing, remove in production
    render json: { message: "Email sync started in background" }
  end

  private

  def set_user
    @user = User.first # replace with auth later
  end
end