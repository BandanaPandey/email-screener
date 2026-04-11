# app/controllers/tasks_controller.rb
class TasksController < ApplicationController
  def update
    task = Task.find(params[:id])
    task.update(status: params[:status])

    render json: task
  end
end