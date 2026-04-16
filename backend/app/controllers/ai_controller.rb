class AiController < ApplicationController
  before_action :authenticate_user!

  def reply_suggestion
    email = current_user.emails.find(params[:email_id])

    result = Ai::ReplyService.new(email).call

    render json: { reply: result }
  end

  def summarize_thread
    email = current_user.emails.find(params[:email_id])

    result = Ai::SummarizationService.new(email).call

    render json: { summary: result }
  end

  def extract_tasks
    email = current_user.emails.find(params[:email_id])

    tasks = Ai::TaskExtractionService.new(email).call

    render json: { tasks: tasks }
  end
end