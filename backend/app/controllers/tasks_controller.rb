# app/controllers/tasks_controller.rb
class TasksController < ApplicationController
  before_action :set_user
  before_action :set_task, only: [:update]

  def index
    tasks = @user.tasks.includes(:email).order(created_at: :desc)

    render json: tasks.as_json(include: :email)
  end

  def update
    if @task.update(task_params)
      render json: @task
    else
      render json: { error: "Update failed" }, status: 422
    end
  end

  private

  def set_task
    @task = @user.tasks.find(params[:id])
  end

  def task_params
    params.require(:task).permit(:status)
  end

   def set_user
    @user = User.first # replace with auth later
  end
end