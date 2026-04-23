# app/controllers/tasks_controller.rb
class TasksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_task, only: [:update]

  def index
    tasks = current_user.tasks.includes(:email).order(created_at: :desc)

    render json: { items: tasks.as_json(include: { email: { only: [:id, :subject] } }) }
  end

  def update
    if @task.update(task_params)
      render json: { task: @task.as_json(include: { email: { only: [:id, :subject] } }) }
    else
      render json: { error: "Update failed" }, status: 422
    end
  end

  private

  def set_task
    @task = current_user.tasks.find(params[:id])
  end

  def task_params
    task_attributes = params[:task].presence || params
    task_attributes.permit(:status)
  end
end
