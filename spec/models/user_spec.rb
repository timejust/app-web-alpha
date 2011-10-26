require 'spec_helper'

describe User do

  it{ should embed_many(:shared_calendars).of_type(Calendar) }
  it{ should have_many(:favorite_locations).of_type(FavoriteLocation) }
  it{ should have_many(:events).of_type(Event) }

  let (:user_access_token) {
    mock_oauth2_access_token
  }

  let (:user_without_token) {
    Factory :user,
      token: nil,
      refresh_token: nil,
      token_expires_at: nil
  }

  let (:user) {
    Factory :user
  }

  let (:users) {
    [Factory(:user)]
  }

  let (:google_calendar) {
    {
      'data' => {
        'id' => "http://google.com/calendar_id",
        'selfLink' => "http://selfLink.google.com",
        'accessControlListLink' => "http://accessControlListLink.google.com"
      }
    }
  }

  describe "user has not authorized application" do

    it "should raise UserException::HasNotAuthorizedApplication on #access_token" do
      lambda {
        user_without_token.access_token
      }.should raise_error(UserException::HasNotAuthorizedApplication)
    end

  end

  describe "user has authorized application" do

    it "should return access_token (OAuth2::AccessToken) on #access_token" do
      time_now = Time.now
      Time.stub!(:now).and_return(time_now)
      OAuth2::AccessToken.should_receive(:new).with(
        OAuthHelper.client,
        user.token,
        user.refresh_token,
        user.token_expires_at.to_i - time_now.to_i
      ).and_return(user_access_token)
      user.access_token.should == user_access_token
    end

  end

  describe "find_or_create_calendars" do

    it "should create google calendars if not present" do
      user.stub!(:access_token).and_return(user_access_token)
      Google::Calendar.should_receive(:list).with(user_access_token).and_return({
        'data' => {
          'items' => []
        }
      })
      User.shared_calendars_properties.each do |properties|
        google_calendar_id = "http://google.com/id_for_#{properties[:name]}"
        Google::Calendar.should_receive(:create).with(
          user_access_token,
          {
            title: properties[:name],
            description: "#{properties[:name]} Timejust Calendar for #{user.email}",
            color: properties[:color],
            selected: true
          }
        ).and_return({
          'data' => {
            'id' => google_calendar_id
          }
        })
        calendar = mock
        user.shared_calendars.should_receive(:find_or_create_by).with(
          name: properties[:name],
          color: properties[:color]
        ).and_return(calendar)
        calendar.should_receive(:update_attributes).with(
          google_short_id: Google::Calendar.extract_google_id(google_calendar_id),
          google_id: google_calendar_id
        )
      end
      user.find_or_create_calendars
    end

    it "should not create google calendars if already present" do
      user.stub!(:access_token).and_return(user_access_token)
      needed_calendars = {
        'data' => {
          'items' => []
        }
      }
      User.shared_calendars_properties.each do |properties|
        needed_calendars['data']['items'] << {
              'id' => "http://google.com/id_for_#{properties[:name]}",
              'title' => properties[:name],
              'color' => properties[:color]
        }
      end
      Google::Calendar.should_receive(:list).with(user_access_token).and_return(needed_calendars)
      User.shared_calendars_properties.each do |properties|
        google_calendar_id = "http://google.com/id_for_#{properties[:name]}"
        Google::Calendar.should_not_receive(:create)
        calendar = mock
        user.shared_calendars.should_receive(:find_or_create_by).with(
          name: properties[:name],
          color: properties[:color]
        ).and_return(calendar)
        calendar.should_receive(:update_attributes).with(
          google_short_id: Google::Calendar.extract_google_id(google_calendar_id),
          google_id: google_calendar_id
        )
      end
      user.find_or_create_calendars
    end

    it "should not create google calendars but update color if has wrong color" do
      user.stub!(:access_token).and_return(user_access_token)
      needed_calendars = {
        'data' => {
          'items' => []
        }
      }
      User.shared_calendars_properties.each do |properties|
        needed_calendars['data']['items'] << {
              'id' => "http://google.com/id_for_#{properties[:name]}",
              'title' => properties[:name],
              'color' => "wrong_color"
        }
      end
      Google::Calendar.should_receive(:list).with(user_access_token).and_return(needed_calendars)
      User.shared_calendars_properties.each do |properties|
        google_calendar_id = "http://google.com/id_for_#{properties[:name]}"
        Google::Calendar.should_not_receive(:create)
        Google::Calendar.should_receive(:update).with(
          user_access_token,
          Google::Calendar.extract_google_id(google_calendar_id),
          {
            selected: true,
            color: properties[:color]
          }
        )
        calendar = mock
        user.shared_calendars.should_receive(:find_or_create_by).with(
          name: properties[:name],
          color: properties[:color]
        ).and_return(calendar)
        calendar.should_receive(:update_attributes).with(
          google_short_id: Google::Calendar.extract_google_id(google_calendar_id),
          google_id: google_calendar_id
        )
      end
      user.find_or_create_calendars
    end

  end

  describe "Pending Events" do

    describe "A user without events" do
      let (:user_without_event) {
        user = Factory :user
        user.events = []
        user.save
        user
      }

      it "should respond false to #has_pending_events" do
        user_without_event.has_pending_events?.should be_false
      end

      it "should return nil on #last_pending_event" do
        user_without_event.last_pending_event.should be_nil
      end

    end

    describe "A user without pending events" do
      let (:user_without_pending_event) {
        user = Factory :user
        user.events << Factory(:event, :state => 'canceled')
        user.save
        user
      }

      it "should respond false to #has_pending_events" do
        user_without_pending_event.has_pending_events?.should be_false
      end

      it "should return nil on #last_pending_event" do
        user_without_pending_event.last_pending_event.should be_nil
      end

    end

    describe "A user with pending events" do
      let (:first_event) {
        event = Factory(:event, :state => 'travels_done', :created_at => Time.now - 10.hours)
      }

      let (:last_event) {
        event = Factory(:event, :state => 'travels_done', :created_at => Time.now)
      }

      let (:user_with_pending_event) {
        user = Factory :user
        user.events << first_event
        user.events << last_event
        user.save
        user
      }

      it "should respond true to #has_pending_events" do
        user_with_pending_event.has_pending_events?.should be_true
      end

      it "should return last pending event on #last_pending_event" do
        user_with_pending_event.last_pending_event.should == last_event
      end

    end

  end

  describe "callbacks" do

    describe "after create" do

      it "should generate authentication_token" do
        u = Factory.build :user
        u.authentication_token.should be_nil
        u.save!
        u.authentication_token.should_not be_nil
      end

    end

  end

  describe "purge travels/travels_steps" do
    let (:user) { Factory :user }
    let(:travel_step1) {
      mock_travel_step
    }
    let(:travel_step2) {
      mock_travel_step
    }

    it "should purge all waiting travels_steps/travels" do
      TravelStep.should_receive(:where).with(
        state:    :waiting,
        user_id:  user.id
      ).and_return([travel_step1, travel_step2])
      travel_step1.should_receive(:destroy)
      travel_step2.should_receive(:destroy)
      user.purge_travels
    end
  end

end
