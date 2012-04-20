module ServiceHelpers
  def stub_calendars_service(action, *params)
    CalendarsStub.send('stub_' + action.to_s, *params)
  end
end