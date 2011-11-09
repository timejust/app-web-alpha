require "spec_helper"

describe TravelStepMailer do
  let(:user) {
    Factory :user, email: "test@example.com"
  }
  let(:event) {
    Factory :event,
      title: "Event Title",
      previous_travel_node: {
        address: "previous address"
      },
      next_travel_node: {
        address: "next address"
      }
  }
  let(:travel_step) {
    Factory :travel_step,
      event: event,
      user: user,
      departure_time: Time.now + 1.hour,
      arrival_time: Time.now + 2.hours,
      travel_type: "forward",
      summary: ['bus', 'tram']
  }
  let(:mail) {
    TravelStepMailer.invitation(travel_step)
  }

  it "should be delivered to user" do
    mail.should deliver_to(user.email)
  end

  it "should have subject" do
    mail.should have_subject(travel_step.invitation_subject)
  end

  it "should have attachment" do
    mail.has_attachments?.should == true
    mail.attachments.first.filename.should == 'invite.ics'
    mail.attachments.first.content_type.should == 'text/calendar'
    lambda{
      Icalendar.parse(mail.parts.first.body)
    }.should_not raise_error
  end
end
