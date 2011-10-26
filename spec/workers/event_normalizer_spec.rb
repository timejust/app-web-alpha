# encoding: UTF-8

require 'spec_helper'

describe EventNormalizer do
  let(:event) {
    Factory :event,
      title: "My Event",
      location: "15 rue poisonnières, 75003, Paris"
  }

  before :each do
    Event.should_receive(:first).with(conditions: {id: event.id.to_s}).and_return(event)
  end

  it "should call normalize_travel_nodes on event" do
    event.should_receive(:normalize_travel_nodes)
    EventNormalizer.perform(event.id.to_s)
  end

  it "should call add_normalized_to_proposals_travel_nodes on event" do
    event.should_receive(:add_normalized_to_proposals_travel_nodes)
    EventNormalizer.perform(event.id.to_s)
  end

  describe "status change" do

    it "should pass event to travels_waiting if travel_nodes_confirmed? and enqueue EventTravelType" do
      Resque.should_receive(:enqueue).with(EventTravelType, event.id.to_s)
      event.should_receive(:travel_nodes_confirmed?).and_return(true)
      EventNormalizer.perform(event.id.to_s)
      event.state.should == 'travels_waiting'
    end

    it "should pass event to travels_waiting if travel_nodes_confirmed?" do
      event.should_receive(:travel_nodes_confirmed?).and_return(false)
      EventNormalizer.perform(event.id.to_s)
      event.state.should == 'travel_nodes_done'
    end

  end

end
