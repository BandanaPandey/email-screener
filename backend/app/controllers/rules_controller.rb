class RulesController < ApplicationController
  before_action :authenticate_user!
  
  def index
    render json: { items: current_user.rules }
  end

  def create
    rule = current_user.rules.create!(rule_params)
    render json: { rule: rule }
  end

  def destroy
    rule = current_user.rules.find(params[:id])
    rule.destroy
    head :no_content
  end

  private

  def rule_params
    params.require(:rule).permit(:field, :operator, :value, :action)
  end
end
