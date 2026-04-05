class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :connected_accounts, dependent: :destroy
  has_many :emails, dependent: :destroy

  # ✅ Allow OAuth users without password
  def password_required?
    super && connected_accounts.empty?
  end
end
