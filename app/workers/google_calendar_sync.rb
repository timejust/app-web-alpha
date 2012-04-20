# encoding: UTF-8
class GoogleCalendarSync
  @queue = :google_calendar_sync
  @user = nil
  
  def self.perform(email)
    @user = User.first(conditions: {email: email})
    if (@user != nil)
      @user.google_calendar_sync
    end
  rescue OAuth2::Error => e
    @user.update_attributes(
      :expired => 1
    )    
  end
end
