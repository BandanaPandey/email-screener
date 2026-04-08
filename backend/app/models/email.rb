class Email < ApplicationRecord
  belongs_to :user
  has_one :email_insight, dependent: :destroy
end
