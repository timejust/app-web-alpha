# encoding: UTF-8
require 'spec_helper'
describe EventAbstractApiProvider do
  let(:event) {
    Factory :event,
      title: "My Event",
      location: "15 rue poisonnières, 75002, Paris",
  }
  let(:travel_ratp_faster) {
    Factory :travel, event_id: event.id, user_id: event.user.id,
    state: 'waiting', travel_mode: :public_transport_faster,
    provider: 'ratp',
  }
  let(:travel_ratp_minimum) {
    Factory :travel, event_id: event.id, user_id: event.user.id,
    state: 'waiting', travel_mode: :public_transport_minimum_change,
    provider: 'ratp',
  }
  let(:travel_google) {
    Factory :travel, event_id: event.id, user_id: event.user.id,
    state: 'waiting', travel_mode: :car,
    provider: 'google-directions',
  }

  before :each do
    event.create_previous_travel_node(:address => "#{Faker::Address.street_name} #{Faker::Address.zip_code}, Paris, France")
    event.create_next_travel_node(:address => "#{Faker::Address.street_name} #{Faker::Address.zip_code}, Paris, France")
    event.create_current_travel_node(:address => "#{Faker::Address.street_name} #{Faker::Address.zip_code}, Paris, France")
    Event.should_receive(:first).with(conditions: {id: event.id.to_s}).and_return(event)
  end

  it 'should create travel' do
    Travel.should_receive(:create).with(event_id: event.id,
                                        user_id: event.user.id,
                                        travel_mode: :public_transport_faster,
                                        provider: 'ratp',
                                        state: 'waiting').and_return(travel_ratp_faster)
    Travel.should_receive(:create).with(event_id: event.id,
                                        user_id: event.user.id,
                                        travel_mode: :public_transport_minimum_change,
                                        provider: 'ratp',
                                        state: 'waiting').and_return(travel_ratp_minimum)
    Travel.should_receive(:create).with(event_id: event.id,
                                        user_id: event.user.id,
                                        travel_mode: :car,
                                        provider: 'google-directions',
                                        state: 'waiting').and_return(travel_google)
    EventAbstractApiProvider.perform(event.id.to_s)
  end
end
