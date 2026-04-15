class RuleEngineService
  def initialize(email, user)
    @email = email
    @user = user
    @rules = user.rules
  end

  def apply!
    @rules.each do |rule|
      apply_rule(rule)
    end
  end

  private

  def apply_rule(rule)
    field_value = extract_field(rule.field)

    return unless field_value.present?

    matched =
      case rule.operator
      when "equals"
        field_value.downcase == rule.value.downcase
      when "contains"
        field_value.downcase.include?(rule.value.downcase)
      else
        false
      end

    perform_action(rule.action) if matched
  end

  def extract_field(field)
    case field
    when "sender"
      @email.sender
    when "subject"
      @email.subject
    when "body"
      @email.body
    else
      nil
    end
  end

  def perform_action(action)
    insight = @email.email_insight || @email.build_email_insight

    case action
    when "mark_important"
      insight.priority_score = 100

    when "mark_action_required"
      insight.priority_score = [insight.priority_score || 0, 90].max

    when "mark_promotion"
      insight.category = "promotion"

    end

    insight.save!
  end
end