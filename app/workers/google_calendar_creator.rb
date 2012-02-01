# encoding: UTF-8
class GoogleCalendarCreator
  @queue = :google_calendar_creator
  @user = nil
  
  def self.perform(email)
    @user = User.first(conditions: {email: email})
    if (@user != nil)
      @user.find_or_create_calendars
    end
  rescue OAuth2::HTTPError => e
    @user.update_attributes(
      :expired => 1
    )    
  end
end
