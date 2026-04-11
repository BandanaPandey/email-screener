class Email < ApplicationRecord
  belongs_to :user
  has_one :email_insight, dependent: :destroy
  has_many :tasks, dependent: :destroy
end
