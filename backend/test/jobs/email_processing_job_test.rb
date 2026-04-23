require "test_helper"

class EmailProcessingJobTest < ActiveJob::TestCase
  setup do
    @user = User.create!(email: unique_email("processing-job"), password: "password-123")
  end

  test "returns cleanly when user does not exist" do
    email = create_email_for(@user)

    assert_nothing_raised do
      EmailProcessingJob.perform_now(-1, email.id)
    end

    assert_nil email.reload.email_insight
    assert_equal 0, email.tasks.count
  end

  test "returns cleanly when email does not exist" do
    assert_nothing_raised do
      EmailProcessingJob.perform_now(@user.id, -1)
    end
  end

  test "skips emails with blank subject" do
    email = create_email_for(@user, subject: "")

    perform_job_with_ai_stubs(email)

    assert_nil email.reload.email_insight
    assert_equal 0, email.tasks.count
  end

  test "skips emails from noreply senders" do
    email = create_email_for(@user, sender: "noreply@example.com")

    perform_job_with_ai_stubs(email)

    assert_nil email.reload.email_insight
    assert_equal 0, email.tasks.count
  end

  test "skips emails from newsletter senders" do
    email = create_email_for(@user, sender: "daily-newsletter@example.com")

    perform_job_with_ai_stubs(email)

    assert_nil email.reload.email_insight
    assert_equal 0, email.tasks.count
  end

  test "skips stale emails" do
    email = create_email_for(@user, received_at: 10.days.ago)

    perform_job_with_ai_stubs(email)

    assert_nil email.reload.email_insight
    assert_equal 0, email.tasks.count
  end

  test "returns without side effects when classification is nil" do
    email = create_email_for(@user)

    perform_job_with_ai_stubs(email, classification: nil)

    assert_nil email.reload.email_insight
    assert_equal 0, email.tasks.count
  end

  test "creates insight summary priority and tasks on happy path" do
    email = create_email_for(@user, subject: "Urgent: board meeting tomorrow")

    perform_job_with_ai_stubs(
      email,
      classification: {
        "category" => "action_required",
        "confidence" => 0.92,
        "reasoning" => "Needs a response"
      },
      priority: {
        score: 97,
        reason: "High priority"
      },
      summary: "Board meeting needs confirmation.",
      extracted_tasks: {
        "tasks" => [
          {
            "title" => "Confirm attendance",
            "due_date" => "2026-04-24",
            "priority" => "high"
          },
          {
            "title" => "Share agenda",
            "due_date" => nil
          }
        ]
      }
    )

    insight = email.reload.email_insight

    assert_equal "action_required", insight.category
    assert_equal 0.92, insight.confidence
    assert_equal "Needs a response", insight.reasoning
    assert_equal 97, insight.priority_score
    assert_equal "High priority", insight.priority_reason
    assert_equal "Board meeting needs confirmation.", insight.summary

    tasks = email.tasks.order(:title).to_a
    assert_equal 2, tasks.size
    confirm_task = tasks.find { |task| task.title == "Confirm attendance" }
    agenda_task = tasks.find { |task| task.title == "Share agenda" }

    assert_equal "pending", confirm_task.status
    assert_equal "high", confirm_task.priority
    assert_equal "pending", agenda_task.status
    assert_equal "medium", agenda_task.priority
  end

  test "remains idempotent across repeated runs" do
    email = create_email_for(@user)

    2.times do
      perform_job_with_ai_stubs(
        email,
        classification: {
          "category" => "important",
          "confidence" => 0.88,
          "reasoning" => "Leadership email"
        },
        priority: {
          score: 88,
          reason: "High priority"
        },
        summary: "Follow up requested.",
        extracted_tasks: {
          "tasks" => [
            {
              "title" => "Send follow-up",
              "due_date" => "2026-04-24",
              "priority" => "high"
            }
          ]
        }
      )
    end

    assert_equal 1, email.reload.tasks.count
    assert_equal 1, EmailInsight.where(email: email).count
  end

  test "ignores malformed extraction payloads" do
    email = create_email_for(@user)

    perform_job_with_ai_stubs(
      email,
      extracted_tasks: {
        "tasks" => [
          {
            "title" => "",
            "due_date" => "2026-04-24",
            "priority" => "high"
          }
        ]
      }
    )

    assert email.reload.email_insight.present?
    assert_equal 0, email.tasks.count
  end

  test "applies matching rules after ai enrichment" do
    email = create_email_for(@user, sender: "vip@example.com")
    @user.rules.create!(
      field: "sender",
      operator: "contains",
      value: "vip@",
      action: "mark_important"
    )

    perform_job_with_ai_stubs(
      email,
      classification: {
        "category" => "social",
        "confidence" => 0.44,
        "reasoning" => "Personal update"
      },
      priority: {
        score: 35,
        reason: "Low priority"
      }
    )

    insight = email.reload.email_insight
    assert_equal "social", insight.category
    assert_equal 100, insight.priority_score
  end

  private

  def create_email_for(user, subject: "Need your input", sender: "boss@example.com", received_at: 1.hour.ago)
    user.emails.create!(
      provider: "google",
      external_id: SecureRandom.uuid,
      subject: subject,
      sender: sender,
      body: "Please review and respond.",
      received_at: received_at
    )
  end

  def perform_job_with_ai_stubs(
    email,
    classification: {
      "category" => "important",
      "confidence" => 0.85,
      "reasoning" => "Requires attention"
    },
    priority: {
      score: 80,
      reason: "High priority"
    },
    summary: "Please review and respond.",
    extracted_tasks: {
      "tasks" => [
        {
          "title" => "Review email",
          "due_date" => nil,
          "priority" => "medium"
        }
      ]
    }
  )
    classification_service = Struct.new(:response) do
      def call
        response
      end
    end.new(classification)

    priority_service = Struct.new(:response) do
      def call
        response
      end
    end.new(priority)

    summary_service = Struct.new(:response) do
      def call
        response
      end
    end.new(summary)

    extraction_service = Struct.new(:response) do
      def call
        response
      end
    end.new(extracted_tasks)

    with_stubbed_class_constructor(Ai::ClassificationService, classification_service) do
      with_stubbed_class_constructor(Ai::PriorityScoringService, priority_service) do
        with_stubbed_class_constructor(Ai::SummarizationService, summary_service) do
          with_stubbed_class_constructor(Ai::TaskExtractionService, extraction_service) do
            EmailProcessingJob.perform_now(@user.id, email.id)
          end
        end
      end
    end
  end
end
