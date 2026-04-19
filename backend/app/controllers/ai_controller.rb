class AiController < ApplicationController
  before_action :authenticate_user!

  def reply_suggestion
    email = current_user.emails.find(params[:email_id])
    insight = email.email_insight

    tone = params[:tone] || "professional"

    reply = Ai::ReplyService.new(email, tone: tone).call

    insight.update!(reply_suggestion: reply) if (insight && reply)

    render json: { reply: reply }
  end

  def summarize_thread
    email = current_user.emails.find(params[:email_id])
    insight = email.email_insight

    summary = Ai::SummarizationService.new(email).call

    insight.update!(summary: summary) if (insight && summary)

    render json: { summary: summary }
  end

  def extract_tasks
    email = current_user.emails.find(params[:email_id])

    tasks = Ai::TaskExtractionService.new(email).call

    render json: { tasks: tasks }
  end
end