class Email < ApplicationRecord
  belongs_to :user
  has_one :email_insight, dependent: :destroy
  has_many :tasks, dependent: :destroy

  validates :external_id, uniqueness: { scope: [:user_id, :provider] }, allow_blank: true
end
