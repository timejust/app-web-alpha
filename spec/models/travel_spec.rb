require 'spec_helper'

describe Travel do
  it{ should belong_to(:event) }
  it{ should belong_to(:user) }
  it{ should have_many(:travel_steps) }
  it{ should validate_inclusion_of(:travel_mode) }
  it{ should validate_inclusion_of(:calendar) }

  describe "#write_travel_steps_to_calendar" do
    let(:access_token) {mock_oauth2_access_token}
    let(:user) {
      user = Factory :user
      user.stub!(:access_token).and_return(access_token)
      user
    }
    let(:event) { Factory(:event, user: user) }
    let(:calendar) {
      Factory.build :calendar
    }

    it "should write travel_steps with no error state to Google Calendar" do
      travel = Factory :travel, user: user
      travel_step1 = Factory(:travel_step,
        event: event, provider: 'ratp', travel: travel
      )
      travel_step2 = Factory(:travel_step,
        event: event, provider: 'google-directions', travel: travel, state: 'error'
      )
      travel.should_receive(:travel_steps).and_return([
        travel_step1,
        travel_step2
      ])
      travel_step1.should_receive(:create_google_event).with(calendar.google_short_id, calendar.name)
      travel_step2.should_not_receive(:create_google_event).with(calendar.google_short_id, calendar.name)
      travel.write_travel_steps_to_calendar(calendar)
    end
  end

  describe "travel_steps callback" do

    let(:travel_step1) {
      Factory :travel_step
    }
    let(:travel_step2) {
      Factory :travel_step
    }
    let(:travel) {
      travel = Factory :travel, :state => :waiting
      travel.travel_steps << travel_step1
      travel.travel_steps << travel_step2
      travel.save!
      travel
    }

    describe "confirm" do

      it "should call confirm on each travel_steps" do
        travel.stub(:travel_steps).and_return([
          travel_step1,
          travel_step2
        ])
        travel_step1.should_receive(:confirm)
        travel_step2.should_receive(:confirm)
        travel.confirm
        travel.confirmed?.should be_true
      end

    end

    describe "bookmark" do

      it "should change travel_step state" do
        travel.bookmark
        travel.bookmarked?.should be_true
      end

      it "should call bookmark on each travel_steps" do
        travel.bookmark
        travel.bookmarked?.should be_true
        travel_step1.reload
        travel_step1.bookmarked?.should be_true
        travel_step2.reload
        travel_step2.bookmarked?.should be_true
      end

    end

    describe "destroy" do

      it "should call destroy on each travel_steps" do
        travel_step1.should_receive(:destroy)
        travel_step2.should_receive(:destroy)
        travel.destroy
      end

    end

    describe "create_ratp_travel_step" do
      let(:access_token) {mock_oauth2_access_token}
      let(:user) {
        user = Factory :user
        user.stub!(:access_token).and_return(access_token)
        user
      }
      let(:event) { Factory(:event, user: user) }
      it 'should create travel steps' do
        travel = Factory :travel, user: user, event: event
        travel_step = travel.create_ratp_travel_step(mock_ratp_itinerary)
        (travel_step.departure_time < travel_step.arrival_time).should be_true
      end

      it 'should have the good date for backward' do
        b = Time.now.beginning_of_day
        event = Factory(:event, user: user, start_time: (b - 2.hours), end_time: (b + 2.hours))
        travel = Factory :travel, user: user, event: event
        travel_step = travel.create_ratp_travel_step(mock_ratp_itinerary, :backward)
        travel_step.departure_time.day.should == event.end_time.day
      end

      it 'should receive update_attributes with transports and summary' do
        travel = Factory :travel, user: user, event: event
        travel.should_receive(:update_attributes).with(transports: mock_ratp_itinerary.transports)
        travel.create_ratp_travel_step(mock_ratp_itinerary)
      end

      describe "errors" do
        it 'should have state error with long duration' do
          travel = Factory :travel, user: user, event: event
          m = mock_ratp_itinerary(:arrival_time => 2.years.from_now, :duration => 2.years)
          travel_step = travel.create_ratp_travel_step(m)
          travel_step.reload.error?.should be_true
        end

        it 'should have state error with not valid itinerary' do
          travel = Factory :travel, user: user, event: event
          m = mock_ratp_itinerary
          m.unstub(:valid?)
          m.stub!(:valid?).and_return(false)
          travel_step = travel.create_ratp_travel_step(m)
          travel_step.reload.error?.should be_true
        end
      end
    end

    describe "create_google_travel_step" do
      let(:access_token) {mock_oauth2_access_token}
      let(:user) {
        user = Factory :user
        user.stub!(:access_token).and_return(access_token)
        user
      }
      let(:event) { Factory(:event, user: user) }
      it 'should create travel steps' do
        travel = Factory :travel, user: user, event: event
        travel_step = travel.create_google_travel_step(mock_google_directions)
        (travel_step.departure_time < travel_step.arrival_time).should be_true
      end
      it 'should receive update_attributes with transports and summary' do
        travel = Factory :travel, user: user, event: event
        travel.should_receive(:update_attributes).with(transports: %w{car})
        travel.create_google_travel_step(mock_google_directions)
      end
    end
  end
end
