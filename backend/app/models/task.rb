class Task < ApplicationRecord
  belongs_to :email

  enum :priority, {
    low: "low",
    medium: "medium",
    high: "high"
  }

  enum :status, {
    pending: "pending",
    completed: "completed"
  }
end
