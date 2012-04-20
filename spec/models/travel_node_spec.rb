# encoding: utf-8
require 'spec_helper'

describe TravelNode do
  # it{ should validate_presence_of(:address) }
  # it{ should be_embedded_in(:event) }
  # it{ should embed_many(:normalized_addresses) }
  # 
  # describe "#normalize" do
  # 
  #   let(:event) {
  #     event = Factory :event
  #     event.create_current_travel_node(address: "15 rue poisonnières, Paris")
  #     event
  #   }
  # 
  #   it "should normalize unconfirmed address" do
  #     event.current_travel_node.update_attribute(:state, 'unconfirmed')
  #     Timejust::NormalizeAddresses.should_receive(:new).with(event.current_travel_node)
  #     event.current_travel_node.normalize
  #   end
  # 
  #   it "should not normalize confirmed address" do
  #     event.current_travel_node.update_attribute(:state, 'confirmed')
  #     Timejust::NormalizeAddresses.should_not_receive(:new)
  #     event.current_travel_node.normalize
  #   end
  # 
  # end
  # 
  # describe "#add_google_info" do
  #   let(:time_now) {
  #     Time.now
  #   }
  #   let(:event) {
  #     around_event = Factory :event,
  #       google_id: 'event_google_id',
  #       title: 'MyTitle',
  #       start_time: time_now,
  #       end_time: time_now,
  #       location: "MyLocation"
  #     event = Factory :event
  #     event.around_events << around_event
  #     event.create_current_travel_node(address: "rue poisonnières, Paris", event_google_id: 'event_google_id')
  #     event
  #   }
  #   it 'should retrieve informations from event.around_events' do
  #     event.current_travel_node.add_google_info(event)
  #     event.current_travel_node.event_title.should == "MyTitle"
  #     event.current_travel_node.event_location.should == "MyLocation"
  #     event.current_travel_node.event_start_time.to_s.should == time_now.to_s
  #     event.current_travel_node.event_end_time.to_s.should == time_now.to_s
  #   end
  # end
end
