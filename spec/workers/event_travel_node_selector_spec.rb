# encoding: UTF-8

require 'spec_helper'
include ActionView::Helpers::TextHelper

describe EventTravelNodeSelector do
  let(:access_token) {mock_oauth2_access_token}
  let(:user) {
    user = Factory :user
    user.stub!(:access_token).and_return(access_token)
    user
  }
  let(:event) {
    event = Factory :event, user: user,
      title: "My Event",
      location: "15 rue poisonnières, 75003, Paris",
      state: 'travel_nodes_progress'
    event.stub(:fetch_around_events).and_return([])
    event.stub(:around_events).and_return([])
    event
  }


  describe('perform') do
    before :each do
      Event.should_receive(:first).with(conditions: {id: event.id.to_s}).and_return(event)
      User.should_receive(:first).with(conditions: {id: event.user.id}).and_return(event.user)
    end

    it "should clean all travel nodes proposals before adding new ones" do
      event.previous_travel_nodes.should_receive(:destroy_all)
      event.current_travel_nodes.should_receive(:destroy_all)
      event.next_travel_nodes.should_receive(:destroy_all)
      EventTravelNodeSelector.perform(event.id.to_s)
    end

    describe "favorites_locations" do

      before :each do
        user.favorite_locations = [
          FavoriteLocation.create(address: "Address 1, Paris", title: "home")
        ]
        user.save!
        event.update_attribute(:location, nil)
      end

      it "should add user favorite locations in all travel_nodes proposals" do
        event.previous_travel_nodes.should_receive(:create).with(
          address: user.favorite_locations.first.address,
          title: user.favorite_locations.first.title,
          weight: 50,
          tag: 'favorite'
        )
        event.current_travel_nodes.should_receive(:create).with(
          address: user.favorite_locations.first.address,
          title: user.favorite_locations.first.title,
          weight: 50,
          tag: 'favorite'
        )
        event.next_travel_nodes.should_receive(:create).with(
          address: user.favorite_locations.first.address,
          title: user.favorite_locations.first.title,
          weight: 50,
          tag: 'favorite'
        )
        EventTravelNodeSelector.perform(event.id.to_s)
      end

    end

    describe "current_travel_nodes" do

      it 'should add event location in current_travel_nodes' do
        EventTravelNodeSelector.perform(event.id.to_s)
        event.current_travel_nodes.all.map(&:address).should include(event.location)
        event.current_travel_nodes.all.map(&:title).should include("#{truncate(event.title, length: 50)} - #{I18n.l(event.start_time, format: :short)} - #{I18n.l(event.end_time, format: :short)}")
      end

    end

    describe "get previous/next travel node" do

      it "should select previous location" do
        event.update_attribute(:location, nil)
        previous_event = Factory :event,
          location: "rue poisonnières, paris",
          title: "boulot",
          start_time: Time.now,
          end_time: Time.now + 1.hour,
          google_id: "google_id"
        event.should_receive(:previous_events).and_return([previous_event])
        event.previous_travel_nodes.should_receive(:create).with(
          address: previous_event.location,
          title: "#{truncate(previous_event.title, length: 50)} - #{I18n.l(previous_event.start_time, format: :short)} - #{I18n.l(previous_event.end_time, format: :short)}",
          weight: 100,
          tag: 'event_location',
          event_title: previous_event.title,
          event_start_time: previous_event.start_time,
          event_end_time: previous_event.end_time,
          event_location: previous_event.location,
          event_google_id: previous_event.google_id
        )
        EventTravelNodeSelector.perform(event.id.to_s)
      end

      it "should select next location" do
        event.update_attribute(:location, nil)
        next_event = Factory :event,
          location: "rue poisonnières, paris",
          title: "boulot",
          start_time: Time.now,
          end_time: Time.now + 1.hour,
          google_id: "google_id"
        event.should_receive(:next_events).and_return([next_event])
        event.next_travel_nodes.should_receive(:create).with(
          address: next_event.location,
          title: "#{truncate(next_event.title, length: 50)} - #{I18n.l(next_event.start_time, format: :short)} - #{I18n.l(next_event.end_time, format: :short)}",
          weight: 100,
          tag: 'event_location',
          event_title: next_event.title,
          event_start_time: next_event.start_time,
          event_end_time: next_event.end_time,
          event_location: next_event.location,
          event_google_id: next_event.google_id
        )
        EventTravelNodeSelector.perform(event.id.to_s)
      end

    end

    it "should call extract_favorite_locations_from_addresses on event" do
      event.should_receive(:extract_favorite_locations_from_addresses)
      EventTravelNodeSelector.perform(event.id.to_s)
    end

    describe "confirmed travel_node" do

      it 'should call add_confirmed_travel_node_to_proposals' do
        event.should_receive(:add_confirmed_travel_node_to_proposals)
        EventTravelNodeSelector.perform(event.id.to_s)
      end

    end

  end

  describe 'not perform' do
    it 'only process travel_nodes_progress state' do
      event.state = 'waiting'
      event.save

      Event.should_receive(:first).with(conditions: {id: event.id.to_s}).and_return(event)
      User.should_not_receive(:first).with(conditions: {id: event.user.id}).and_return(event.user)

      EventTravelNodeSelector.perform(event.id.to_s)
    end
  end

end
