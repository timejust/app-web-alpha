# encoding: utf-8
require 'spec_helper'

describe Event do

  it{ should belong_to(:user) }
  it{ should have_many(:travels) }
  it{ should validate_presence_of(:user) }
  it{ should validate_presence_of(:start_time) }
  it{ should validate_presence_of(:end_time) }
  it{ should embed_many(:previous_travel_nodes).of_type(TravelNode) }
  it{ should embed_many(:current_travel_nodes).of_type(TravelNode) }
  it{ should embed_many(:next_travel_nodes).of_type(TravelNode) }
  it{ should embed_one(:previous_travel_node).of_type(TravelNode) }
  it{ should embed_one(:current_travel_node).of_type(TravelNode) }
  it{ should embed_one(:next_travel_node).of_type(TravelNode) }

  it "should have a valid factory" do
    Factory(:event).should be_valid
  end

  it "should have initialize state to travel_nodes_progress" do
    event = Event.new(
      Factory.attributes_for(:event, user: Factory(:user))
    )
    event.save!
    event.state.should == 'waiting'
  end

  it "should parse Google event hash and return Event" do
    event = Event.parse_from_google_gadget(mock_google_event_json)
    event.should be_kind_of(Event)
    event.title.should == "Tennis with Beth"
    event.start_time.should be_kind_of(Time)
    event.end_time.should be_kind_of(Time)
  end

  describe "should parse Google event hash and return Event" do

    it "should parse single date event" do
      google_data_event = {
        'id' => 'id',
        'title' => 'title',
        'location' => 'location',
        'creator' => {
          'email' => "email@example.com"
        },
        'when' => [
          {'start' => Time.now, 'end' => Time.now}
        ]
      }
      events = Event.parse_from_google_data(google_data_event)
      events.count.should == 1
      events[0].should be_kind_of(Event)
      events[0].title.should == "title"
      events[0].start_time.should be_kind_of(Time)
      events[0].end_time.should be_kind_of(Time)
    end

    it "should parse multiple dates event" do
      google_data_event = {
        'id' => 'id',
        'title' => 'title',
        'location' => 'location',
        'creator' => {
          'email' => "email@example.com"
        },
        'when' => [
          {'start' => Time.now, 'end' => Time.now},
          {'start' => Time.now, 'end' => Time.now}
        ]
      }
      events = Event.parse_from_google_data(google_data_event)
      events.count.should == 2
      events[0].should be_kind_of(Event)
      events[1].should be_kind_of(Event)
      events[0].title.should == "title"
      events[1].title.should == "title"
      events[0].start_time.should be_kind_of(Time)
      events[1].start_time.should be_kind_of(Time)
      events[0].end_time.should be_kind_of(Time)
      events[1].end_time.should be_kind_of(Time)
    end

    it "should not parse event without dates" do
      google_data_event = {
        'id' => 'id',
        'title' => 'title',
        'location' => 'location',
        'creator' => {
          'email' => "email@example.com"
        }
      }
      events = Event.parse_from_google_data(google_data_event)
      events.count.should == 0
    end
  end

  describe "#add_google_info" do

    it "should add google info if not already present" do
      access_token = mock_oauth2_access_token
      time_now = Time.now
      e = Event.new(title: "test", start_time: time_now, end_time: time_now, google_calendar_id: "test@gmail.com")
      Google::Event.should_receive(:search_by_date_range).with(
        access_token,
        e.start_time,
        e.start_time + 1.minutes,
        "test@gmail.com"
      ).and_return({
        'data' => {
          'items' => [
            {'title' => "wrong event", 'details' => "my wrong details", 'id' => "my wrong id"},
            {'title' => "test", 'details' => "my details", 'id' => "my id",},
          ]
        }
      })
      e.should_receive(:details=).with('my details')
      e.should_receive(:google_id=).with('my id')
      e.add_google_info(access_token)
    end

    it "should not add google info if already present" do
      e = Event.new(title: "test")
      e.should_receive(:google_id).and_return('a_fake_id')
      e.add_google_info(nil)
    end

  end

  describe "#check_favorite_locations" do
    let(:user) { Factory :user }
    let(:event) { Factory(:event, user: user) }

    it "should create favorite location if a previous/current/next travel node title is given" do
      event.create_previous_travel_node(address: "My previous address", title: "tag1")
      event.create_current_travel_node(address: "My current address", title: "tag2")
      event.create_next_travel_node(address: "My next address", title: "tag3")
      FavoriteLocation.should_receive(:create_from_travel_node).with(user, event.previous_travel_node)
      FavoriteLocation.should_receive(:create_from_travel_node).with(user, event.current_travel_node)
      FavoriteLocation.should_receive(:create_from_travel_node).with(user, event.next_travel_node)
      event.check_for_favorite_locations
    end

    it "should not create favorite location if a previous/current/next travel node title is not given" do
      event.create_previous_travel_node(address: "My previous address")
      event.create_current_travel_node(address: "My current address")
      event.create_next_travel_node(address: "My next address")
      FavoriteLocation.should_not_receive(:create_from_travel_node).with(user, event.previous_travel_node)
      FavoriteLocation.should_not_receive(:create_from_travel_node).with(user, event.current_travel_node)
      FavoriteLocation.should_not_receive(:create_from_travel_node).with(user, event.next_travel_node)
      event.check_for_favorite_locations
    end
  end

  describe '#pending' do

    it "should respond false if event is not pending" do
      event = Factory :event, :state => 'canceled'
      event.pending?.should be_false
    end

    it "should respond true if event is pending" do
      event = Factory :event, :state => 'travels_done'
      event.pending?.should be_true
    end

  end

  describe "#write_travels_to_calendar" do
    let(:access_token) {mock_oauth2_access_token}
    let(:user) {
      user = Factory :user
      user.stub!(:access_token).and_return(access_token)
      user
    }
    let(:travel1) {
      Factory :travel, user: user, calendar: configatron.shared_calendars.car.name
    }
    let(:travel2) {
      Factory :travel, user: user, calendar: configatron.shared_calendars.public_transport_faster.name
    }
    let(:event) {
      event = Factory(:event,
        user: user, travels: [travel1, travel2]
      )
      event
    }

    it "should write all travels to Google Calendar" do
      user.shared_calendars.find_or_create_by(Factory.attributes_for(:calendar, name: configatron.shared_calendars.car.name))
      user.shared_calendars.find_or_create_by(Factory.attributes_for(:calendar, name: configatron.shared_calendars.public_transport_faster.name))
      user.shared_calendars.find_or_create_by(Factory.attributes_for(:calendar, name: configatron.shared_calendars.public_transport_minimum_change.name))

      travel1.should_receive(:write_travel_steps_to_calendar).
        with(user.shared_calendars.where(name: travel1.calendar).first)
      travel2.should_receive(:write_travel_steps_to_calendar).
        with(user.shared_calendars.where(name: travel2.calendar).first)

      event.write_travels_to_calendar
    end

  end

  describe "callbacks" do

    it "should push to initial worker after create" do
      e = Factory.build :event
      e.should_receive(:push_to_worker)
      e.save!
    end

    it "should push to event initial worker after wait transition" do
      e = Factory :event, state: :travel_nodes_done
      e.should_receive(:push_to_worker)
      e.wait!
    end

  end

  describe "push to worker" do

    it "should enqueue to EventInitial worker" do
      e = Factory :event
      Resque.should_receive(:enqueue).with(EventInitial, e.id.to_s)
      e.send(:push_to_worker)
    end

  end

  describe "travel_nodes_confirmed?" do
    let(:event) {
      Factory :event
    }

    it "should return true if all travel nodes are confirmed" do
      event.create_previous_travel_node(address: "My previous address", state: :confirmed)
      event.create_current_travel_node(address: "My current address", state: :confirmed)
      event.create_next_travel_node(address: "My next address", state: :confirmed)
      event.travel_nodes_confirmed?.should be_true
    end

    it "should return false if at least one travel node is unconfirmed" do
      event.create_previous_travel_node(address: "My previous address", state: :confirmed)
      event.create_current_travel_node(address: "My current address", state: :confirmed)
      event.create_next_travel_node(address: "My next address", state: :unconfirmed)
      event.travel_nodes_confirmed?.should be_false
    end

    it "should return false if travel nodes are not filled" do
      event.travel_nodes_confirmed?.should be_false
    end

  end

  describe "#normalize_travel_nodes" do

    let(:event) {
      event = Factory :event
      event.create_previous_travel_node(address: "fake address")
      event.create_current_travel_node(address: "fake address")
      event.create_next_travel_node(address: "fake address")
      event.previous_travel_nodes.create(address: "fake address")
      event.current_travel_nodes.create(address: "fake address")
      event.next_travel_nodes.create(address: "fake address")
      event
    }

    it "should normalize all associated travel nodes" do
      event.previous_travel_node.should_receive(:normalize)
      event.current_travel_node.should_receive(:normalize)
      event.next_travel_node.should_receive(:normalize)
      event.previous_travel_nodes.each do |travel_node|
        travel_node.should_receive(:normalize)
      end
      event.current_travel_nodes.each do |travel_node|
        travel_node.should_receive(:normalize)
      end
      event.next_travel_nodes.each do |travel_node|
        travel_node.should_receive(:normalize)
      end
      event.normalize_travel_nodes
    end

  end

  describe "add_normalized_to_proposals_travel_nodes" do

    let(:event) {
      event = Factory :event
      event.create_current_travel_node(address: "fake address", title: "title 1")
      event.current_travel_nodes.create(address: "fake address", title: "title 2")
      event
    }

    it "should add travel node proposal if travel node is unconfirmed and has normalized addresses" do
      event.current_travel_nodes.first.update_attribute(:state, 'unconfirmed')
      event.current_travel_nodes.first.normalized_addresses.create(
        formatted_address: "formatted address"
      )
      event.current_travel_nodes.first.normalized_addresses.create(
        formatted_address: "formatted address 2"
      )

      event.current_travel_node.update_attribute(:state, 'unconfirmed')
      event.current_travel_node.normalized_addresses.create(
        formatted_address: "formatted address 3"
      )
      event.current_travel_node.normalized_addresses.create(
        formatted_address: "formatted address 4"
      )

      event.should_receive(:add_travel_node_proposal).with(
        :current, 'formatted address', event.current_travel_nodes.first
      )
      event.should_receive(:add_travel_node_proposal).with(
        :current, 'formatted address 2', event.current_travel_nodes.first
      )

      event.should_receive(:add_travel_node_proposal).with(
        :current, 'formatted address 3', event.current_travel_node
      )
      event.should_receive(:add_travel_node_proposal).with(
        :current, 'formatted address 4', event.current_travel_node
      )
      event.add_normalized_to_proposals_travel_nodes
      event.current_travel_node.weight.should == 200
    end

    it "should not add travel node proposal if travel node is confirmed" do
      event.current_travel_nodes.first.update_attribute(:state, 'confirmed')
      event.current_travel_node.update_attribute(:state, 'confirmed')

      event.should_not_receive(:add_travel_node_proposal)

      event.add_normalized_to_proposals_travel_nodes
    end

    it "should destroy non normalized travel node proposals" do
      event.current_travel_nodes.first.update_attribute(:state, 'unconfirmed')
      event.current_travel_nodes.first.normalized_addresses.create(
        formatted_address: "formatted address"
      )
      event.current_travel_nodes.first.should_receive(:destroy)
      event.add_normalized_to_proposals_travel_nodes
    end

  end

  describe "add_travel_node_proposal" do

    let(:event) {
      Factory :event
    }

    it "should add proposals in each type of travel nodes" do
      event.previous_travel_nodes.destroy_all
      event.current_travel_nodes.destroy_all
      event.next_travel_nodes.destroy_all

      previous_node = Factory.build :travel_node,
        weight: 1,
        title: "title 1"
      current_node = Factory.build :travel_node,
        weight: 2,
        title: "title 2"
      next_node = Factory.build :travel_node,
        weight: 3,
        title: "title 3"

      event.add_travel_node_proposal('previous', 'previous address', previous_node)
      event.add_travel_node_proposal('current', 'current address', current_node)
      event.add_travel_node_proposal('next', 'next address', next_node)

      event.previous_travel_nodes.count.should == 1
      event.previous_travel_nodes.first.address.should == 'previous address'
      event.previous_travel_nodes.first.title.should == 'title 1'
      event.previous_travel_nodes.first.weight.should == 1
      event.current_travel_nodes.count.should == 1
      event.current_travel_nodes.first.address.should == 'current address'
      event.current_travel_nodes.first.title.should == 'title 2'
      event.current_travel_nodes.first.weight.should == 2
      event.next_travel_nodes.count.should == 1
      event.next_travel_nodes.first.address.should == 'next address'
      event.next_travel_nodes.first.title.should == 'title 3'
      event.next_travel_nodes.first.weight.should == 3
    end

  end

  describe "departure arrival times" do
    before do
      @estimated_time = 10.minutes
      @e = Factory(:event)
    end
    it 'should calculate the forward departure time' do
      @e.forward_departure(@estimated_time).should == (@e.start_time - @estimated_time - @e.before_start_time.minutes)
    end
  end

  describe "around_events" do

    let(:access_token) {mock_oauth2_access_token}
    let(:user) {
      user = Factory :user
      user.stub!(:access_token).and_return(access_token)
      user
    }

    let(:event) {
      Factory :event,
        start_time: Time.now,
        end_time: Time.now + 1.hours,
        user: user,
        google_calendar_id: "calendar_id"
    }

    let(:events) {
      [Factory(:event)]
    }

    it "should request user google calendar" do
      Google::Event.should_receive(:search_by_date_range).with(
        access_token,
        (event.start_time - 2.days).at_beginning_of_day,
        (event.end_time + 2.days).end_of_day,
        'calendar_id'
      ).and_return({'data' => {
        'totalResults' => 1,
        'items' => [
          {
            'id' => 'id',
            'title' => 'title',
            'location' => 'location',
            'when' => [ {'start' => events.first.start_time, 'end' => events.first.end_time} ]
          }
        ]
      }})
      Event.should_receive(:parse_from_google_data).with(
        {
          'id' => 'id',
          'title' => 'title',
          'location' => 'location',
          'when' => [ {'start' => events.first.start_time, 'end' => events.first.end_time} ]
        }
      ).and_return(events)
      events = event.around_events(2)
      events.should == events
    end
  end

  describe "previous events" do

    let(:event) {
      Factory :event,
        start_time: Time.parse("2011-09-27 12:00:00 +0200"),
        end_time: Time.parse("2011-09-27 14:00:00 +0200")
    }

    it "should select last event with a location before the event" do
      event_with_location = Factory :event,
        start_time: Time.parse("2011-09-27 09:00:00 +0200"),
        end_time: Time.parse("2011-09-27 10:00:00 +0200"),
        location: "rue poisonnières, paris"
      event_without_location = Factory :event,
        start_time: Time.parse("2011-09-27 10:00:00 +0200"),
        end_time: Time.parse("2011-09-27 11:00:00 +0200")
      event_adjacent = Factory :event,
        start_time: Time.parse("2011-09-27 12:00:00 +0200"),
        end_time: Time.parse("2011-09-27 12:30:00 +0200"),
        location: "rue poisonnières, paris"
      event.should_receive(:around_events).and_return([event_without_location, event_with_location, event_adjacent])
      event.previous_events.should include(event_with_location)
    end

  end

  describe "next event" do

    let(:event) {
      Factory :event,
        start_time: Time.parse("2011-09-27 12:00:00 +0200"),
        end_time: Time.parse("2011-09-27 14:00:00 +0200")
    }

    it "should select first event with a location after the event" do
      event_with_location = Factory :event,
        start_time: Time.parse("2011-09-27 18:00:00 +0200"),
        end_time: Time.parse("2011-09-27 19:00:00 +0200"),
        location: "rue poisonnières, paris"
      event_without_location = Factory :event,
        start_time: Time.parse("2011-09-27 15:00:00 +0200"),
        end_time: Time.parse("2011-09-27 16:00:00 +0200")
      event_adjacent = Factory :event,
        start_time: Time.parse("2011-09-27 13:30:00 +0200"),
        end_time: Time.parse("2011-09-27 15:00:00 +0200"),
        location: "rue poisonnières, paris"
      event.should_receive(:around_events).and_return([event_without_location, event_with_location, event_adjacent])
      event.next_events.should include(event_with_location)
    end

  end

  describe "extract_favorite_locations_from_addresses" do

    let(:user) {
      user = Factory :user
      user.favorite_locations = [
        FavoriteLocation.create(address: "Address 1, Paris", title: "work")
      ]
      user.save!
      user
    }

    let(:event) {
      event = Factory :event, user: user

      event.create_previous_travel_node(address: "work")
      event.create_current_travel_node(address: " work")
      event.create_next_travel_node(address: "work ")

      event.previous_travel_nodes.create(address: "work", title: "Title 1")
      event.current_travel_nodes.create(address: " work", title: "Title 2")
      event.next_travel_nodes.create(address: "work ", title: "Title 3")
      event
    }

    it "should replace address if a favorite title is given" do
      event.extract_favorite_locations_from_addresses
      event.reload

      event.previous_travel_node.address.should == "Address 1, Paris"
      event.previous_travel_node.title.should == "work"
      event.current_travel_node.address.should == "Address 1, Paris"
      event.current_travel_node.title.should == "work"
      event.next_travel_node.address.should == "Address 1, Paris"
      event.next_travel_node.title.should == "work"

      event.previous_travel_nodes.first.address.should == "Address 1, Paris"
      event.previous_travel_nodes.first.title.should == "Title 1"
      event.current_travel_nodes.first.address.should == "Address 1, Paris"
      event.current_travel_nodes.first.title.should == "Title 2"
      event.next_travel_nodes.first.address.should == "Address 1, Paris"
      event.next_travel_nodes.first.title.should == "Title 3"
    end

  end

  describe "add_confirmed_travel_node_to_proposals" do

    let(:event) {
      event = Factory :event
      event.create_previous_travel_node(address: "fake address 1", state: 'confirmed')
      event.create_current_travel_node(address: "fake address 2", state: 'confirmed')
      event.create_next_travel_node(address: "fake address 3", state: 'confirmed')
      event
    }

    it "should add travel node proposal if travel node is unconfirmed and has normalized addresses" do
      event.should_receive(:add_travel_node_proposal).with(
        :previous, 'fake address 1', event.previous_travel_node
      )
      event.should_receive(:add_travel_node_proposal).with(
        :current, 'fake address 2', event.current_travel_node
      )
      event.should_receive(:add_travel_node_proposal).with(
        :next, 'fake address 3', event.next_travel_node
      )
      event.add_confirmed_travel_node_to_proposals
      event.previous_travel_node.weight.should == 500
      event.current_travel_node.weight.should == 500
      event.next_travel_node.weight.should == 500
    end

  end

  describe "remove_duplicate_provider_errors" do
    it "should destroy travel if there another with same provider in error" do
      event = Factory :event
      travel1 = Factory :travel,
        provider: 'ratp',
        event: event
      Factory :travel_step,
        travel: travel1,
        state: 'error'
      Factory :travel_step,
        travel: travel1,
        state: 'error'
      travel2 = Factory :travel,
        provider: 'ratp',
        event: event
      Factory :travel_step,
        travel: travel2,
        state: 'error'
      Factory :travel_step,
        travel: travel2,
        state: 'error'
      travel3 = Factory :travel,
        provider: 'google-directions',
        event: event
      Factory :travel_step,
        travel: travel3,
        state: 'waiting'
      Factory :travel_step,
        travel: travel3,
        state: 'error'
      travel4 = Factory :travel,
        provider: 'google-directions',
        event: event
      Factory :travel_step,
        travel: travel4,
        state: 'waiting'
      Factory :travel_step,
        travel: travel4,
        state: 'error'
      event.reload
      event.travels.map(&:provider).should == ['ratp', 'ratp', 'google-directions', 'google-directions']
      event.remove_duplicate_provider_errors
      event.reload
      event.travels.map(&:provider).should == ['ratp', 'google-directions', 'google-directions']
    end
  end

end
