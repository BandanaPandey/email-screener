class EmailsController < ApplicationController
  before_action :set_user

  def index
    emails = @user.emails.order(received_at: :desc).limit(50)
    render json: emails
  end

  def sync
    Gmail::FetchEmailsService.new(@user).call
    render json: { message: "Sync started" }
  end

  private

  def set_user
    @user = User.first # replace with auth later
  end
end