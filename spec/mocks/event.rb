#encoding: utf-8
def mock_event(stubs={})
  mock = mock_model(Event, stubs)
  mock.stub!(:id).and_return("47cc67093475061e3d95369d")
  mock.stub!(:to_json).and_return(mock_event_json)
  mock
end

def mock_event_json
  "{\"_id\":\"4e400bc1cc414b1060000003\",\"end_time\":\"2011-07-29T01:37:40+02:00\",\"location\":\"Rolling Lawn Courts\",\"start_time\":\"2011-07-28T21:39:40+02:00\",\"title\":\"Tennis with Beth\",\"user_id\":\"4e3fa6f9cc414b2ca6000002\"}"
end

def mock_google_event_json
  {
    timezone: "Europe/Paris",
    startTime: {
      year: 2011,
      month: 7,
      date: 28,
      hour: 21,
      minute: 39,
      second: 40
    },
    endTime: {
      year: 2011,
      month: 7,
      date: 29,
      hour: 1,
      minute: 37,
      second: 40
    },
    title: "Tennis with Beth",
    location: "Rolling Lawn Courts",
    id: "MmZwZmEyN2pjNmw5aXNkM3U3aDJoYnNja3MgcW1kOTdrN201YWtrY3M2ZjhrbzlxNDBnMzRAZw",
    status: "organizer",
    color: "#EEA2BB",
    palette: {
      darkest: "#B1365F",
      dark: "#DD4477",
      medium: "#E67399",
      light: "#EEA2BB",
      lightest: "#F5C7D6"
    },
    attendees: [],
    attendeeCount: 0,
    calendar: {
      email: "qmd97k7m5akkcs6f8ko9q40g34@group.calendar.google.com",
      name: "PinkProposal"
    },
    creator: "null",
    owner: {
      email: "qmd97k7m5akkcs6f8ko9q40g34@group.calendar.google.com",
      name: "PinkProposal"
    },
    accessLevel: "read"
  }.to_json
end
