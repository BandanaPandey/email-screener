require "test_helper"

class TasksControllerTest < ActionDispatch::IntegrationTest
  test "index returns tasks with email subject" do
    user = sign_in_with_google(email: unique_email("tasks"))
    email = user.emails.create!(
      provider: "google",
      external_id: SecureRandom.uuid,
      subject: "Quarterly report",
      sender: "ceo@example.com",
      body: "Please send the report",
      received_at: Time.current
    )
    email.tasks.create!(title: "Send report", priority: "high", status: "pending")

    get "/tasks"

    assert_response :success

    payload = JSON.parse(response.body)
    task = payload.fetch("items").first

    assert_equal "Send report", task.fetch("title")
    assert_equal "Quarterly report", task.dig("email", "subject")
  end

  test "update accepts nested task params" do
    user = sign_in_with_google(email: unique_email("task-update"))
    email = user.emails.create!(
      provider: "google",
      external_id: SecureRandom.uuid,
      subject: "Board update",
      sender: "board@example.com",
      body: "Need an update",
      received_at: Time.current
    )
    task = email.tasks.create!(title: "Prepare update", priority: "medium", status: "pending")

    patch "/tasks/#{task.id}", params: { task: { status: "completed" } }

    assert_response :success
    assert_equal "completed", JSON.parse(response.body).dig("task", "status")
    assert_equal "completed", task.reload.status
  end

  test "update accepts top level params for compatibility" do
    user = sign_in_with_google(email: unique_email("task-top-level"))
    email = user.emails.create!(
      provider: "google",
      external_id: SecureRandom.uuid,
      subject: "Reminder",
      sender: "team@example.com",
      body: "Please review",
      received_at: Time.current
    )
    task = email.tasks.create!(title: "Review note", priority: "medium", status: "pending")

    patch "/tasks/#{task.id}", params: { status: "completed" }

    assert_response :success
    assert_equal "completed", task.reload.status
  end
end
