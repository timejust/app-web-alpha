require 'spec_helper'

describe TravelStep do
  it{ should belong_to(:event) }
  it{ should belong_to(:user) }
  it{ should belong_to(:travel) }
  it{ should validate_presence_of(:event) }
  it{ should validate_presence_of(:user) }
  it{ should validate_presence_of(:travel) }
  it{ should validate_presence_of(:provider) }
  it{ should validate_presence_of(:travel_type) }
  it{ should validate_inclusion_of(:travel_type) }

  describe "callbacks" do

    it "should destroy_google_events before destroy" do
      travel_step = Factory :travel_step
      travel_step.should_receive(:destroy_google_event)
      travel_step.destroy
    end

    it "should destroy travel if there is no more related travel_steps" do
      travel = Factory :travel
      travel_step1 = Factory :travel_step, travel: travel
      travel_step2 = Factory :travel_step, travel: travel
      travel_step1.destroy
      travel.should_receive(:destroy)
      travel_step2.destroy
    end

  end

  describe "destroy_google_event" do

    it "should destroy related google event" do
      travel_step = Factory :travel_step, :google_event_id => "event_id", :google_calendar_id => "calendar_id"
      access_token = mock_oauth2_access_token
      travel_step.stub_chain(:event, :user, :access_token).and_return(access_token)
      Google::Event.should_receive(:destroy).with(
        access_token,
        "calendar_id",
        "event_id"
      )
      travel_step.destroy
    end

  end

  describe "create_google_event" do

    it "should create a google event on given calendar" do
      travel_step = Factory :travel_step
      access_token = mock_oauth2_access_token
      travel_step.should_receive(:google_event_detail).and_return('no details')
      travel_step.stub_chain(:event, :user, :access_token).and_return(access_token)
      travel_step.stub(:travel_type).and_return('forward')
      travel_step.stub_chain(:event, :previous_travel_node, :address).and_return('previous address')
      Google::Event.should_receive(:create).with(
        access_token,
        'calendar_id',
        {
          title: travel_step.summary.join('-'),
          details: 'no details',
          transparency: "opaque",
          status: "confirmed",
          location: "previous address",
          when: [
            {
              start: travel_step.departure_time.utc.iso8601,
              end: travel_step.arrival_time.utc.iso8601
            }
          ]
        }
      ).and_return({
        'data' => {
          'id' => "42"
        }
      })
      travel_step.create_google_event('calendar_id', 'BlackCalendar')
      travel_step.google_event_id.should == "42"
      travel_step.google_calendar_id.should == "calendar_id"
      travel_step.calendar.should == "BlackCalendar"
    end

  end

  describe "confirm" do
    let(:access_token) {
      mock_oauth2_access_token
    }
    let(:user) {
      user = Factory :user
      user.stub(:access_token).and_return(access_token)
      user
    }

    it "should destroy google event, destroy other proposals and send invitation by mail" do
      event = Factory :event, :google_calendar_id => "calendar_id"
      travel_step = Factory :travel_step,
        google_event_id: "event_id",
        google_calendar_id: "calendar_id",
        event: event,
        user: user
      travel_step.should_receive(:destroy_google_event)
      travel_step.should_receive(:destroy_other_proposals)
      travel_step.should_receive(:send_invitation_by_mail)
      travel_step.confirm
    end

    describe "destroy_other_proposals" do

      it "should destroy all other travels_steps for the current event and travel_type" do
        travel = Factory :travel
        other_travel = Factory :travel
        event = Factory :event
        travel_step = Factory :travel_step,
          event: event,
          user: user,
          travel: other_travel,
          travel_type: "forward"
        other_travel_step = Factory :travel_step,
          event: event,
          user: user,
          travel: travel,
          travel_type: "forward"
        TravelStep.where(event_id: event.id, travel_type: "forward").count.should == 2
        travel_step.destroy_other_proposals
        TravelStep.where(event_id: event.id, travel_type: "forward").count.should == 1
        TravelStep.where(event_id: event.id, travel_type: "forward").should == [travel_step]
      end

    end

  end

  describe "bookmark" do

    let(:access_token) {
      mock_oauth2_access_token
    }
    let(:user) {
      user = Factory :user
      user.stub(:access_token).and_return(access_token)
      user
    }

    it "should destroy other proposals" do
      event = Factory :event, :google_calendar_id => "calendar_id"
      travel_step = Factory :travel_step,
        event: event,
        user: user
      travel_step.should_receive(:destroy_other_proposals)
      travel_step.bookmark
    end

  end

  describe "google_event_detail" do
    let(:event) {
      Factory :event
    }

    it "should generate google event detail" do
      travel_step = Factory :travel_step,
        event: event,
        steps: ['step1', 'step2']
      detail = <<-EOF
#{travel_step.public_url}
#{travel_step.steps.join('
')}
      EOF
      travel_step.google_event_detail.should == detail
    end

  end

  describe "to_ics" do
    let(:user) {
      Factory :user, email: "test@example.com"
    }
    let(:event) {
      Factory :event,
        title: "Event Title",
        previous_travel_node: {
          address: "previous address"
        },
        current_travel_node: {
          address: "current address"
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
        summary: ['bus', 'tram']
    }

    it "should generate ics string" do
      lambda{
        cal = Icalendar.parse(travel_step.to_ics)
      }.should_not raise_error
    end

  end

  describe 'send_invitation_by_mail' do
    let(:event) {
      Factory :event,
        title: "Event Title",
        previous_travel_node: {
          address: "previous address"
        },
        current_travel_node: {
          address: "current address"
        },
        next_travel_node: {
          address: "next address"
        }
    }

    let(:travel_step) {
      Factory :travel_step,
        event: event
    }

    let(:access_token) {
      mock_oauth2_access_token
    }
    let(:user) {
      user = Factory :user
      user.stub(:access_token).and_return(access_token)
      user
    }

    it "should call TravelStepMailer.invitation" do
      mail = mock
      TravelStepMailer.should_receive(:invitation).with(travel_step).and_return(mail)
      mail.should_receive(:deliver)
      travel_step.send_invitation_by_mail
    end

    it "should generate invitation subject" do
      travel_step.update_attribute(:travel_type, 'forward')
      travel_step.invitation_subject.should == "Timejust invitation for travel to #{travel_step.event.title} on #{I18n.l(travel_step.departure_time, :format => :date)}"
      travel_step.update_attribute(:travel_type, 'backward')
      travel_step.invitation_subject.should == "Timejust invitation for travel from #{travel_step.event.title} on #{I18n.l(travel_step.departure_time, :format => :date)}"
    end

    it "should generate invitation title" do
      travel = Factory :travel, user: user, event: event
      travel_step = travel.create_ratp_travel_step(mock_ratp_itinerary)
      travel_step.invitation_title.should == travel_step.summary.join('-')
    end

    it "should generate invitation location" do
      travel_step.update_attribute(:travel_type, 'forward')
      travel_step.invitation_location.should == "previous address"
      travel_step.update_attribute(:travel_type, 'backward')
      travel_step.invitation_location.should == "current address"
    end

  end

end
