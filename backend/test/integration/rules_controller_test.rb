require "test_helper"

class RulesControllerTest < ActionDispatch::IntegrationTest
  test "index returns current user rules" do
    user = sign_in_with_google(email: unique_email("rules"))
    user.rules.create!(field: "sender", operator: "contains", value: "vip", action: "mark_important")

    get "/rules"

    assert_response :success
    payload = JSON.parse(response.body)

    assert_equal 1, payload.fetch("items").size
    assert_equal "sender", payload.fetch("items").first.fetch("field")
  end

  test "create returns normalized rule payload" do
    sign_in_with_google(email: unique_email("rule-create"))

    assert_difference -> { Rule.count }, 1 do
      post "/rules", params: {
        rule: {
          field: "subject",
          operator: "contains",
          value: "Invoice",
          action: "mark_action_required"
        }
      }
    end

    assert_response :success
    assert_equal "mark_action_required", JSON.parse(response.body).dig("rule", "action")
  end

  test "destroy removes the rule" do
    user = sign_in_with_google(email: unique_email("rule-destroy"))
    rule = user.rules.create!(field: "body", operator: "contains", value: "unsubscribe", action: "mark_promotion")

    assert_difference -> { Rule.count }, -1 do
      delete "/rules/#{rule.id}"
    end

    assert_response :no_content
  end
end
