class ConnectedAccount < ApplicationRecord
  belongs_to :user

  def expired?
    expires_at.nil? || Time.current >= expires_at
  end
end
