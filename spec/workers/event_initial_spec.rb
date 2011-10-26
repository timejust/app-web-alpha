# encoding: UTF-8

require 'spec_helper'

describe EventInitial do
  let(:access_token) {mock_oauth2_access_token}

  before do
    @event = Factory(:event)
    @event.user.stub!(:access_token).and_return(access_token)
  end

  it 'should perform' do
    Resque.should_receive(:enqueue).with(EventTravelNodeSelector, @event.id.to_s)
    Event.should_receive(:first).with(conditions: {id: @event.id.to_s}).and_return(@event)
    User.should_receive(:first).with(conditions: {id: @event.user.id}).and_return(@event.user)
    @event.should_receive(:add_google_info).with(@event.user.access_token)

    EventInitial.perform(@event.id.to_s)

    @event.reload.state.should == 'travel_nodes_progress'
  end

  it 'should not perform' do
    @event.state = 'travel_nodes_progress'
    @event.save

    Resque.should_not_receive(:enqueue).with(EventTravelNodeSelector, @event.id.to_s)
    Event.should_receive(:first).with(conditions: {id: @event.id.to_s}).and_return(@event)
    User.should_not_receive(:first).with(conditions: {id: @event.user.id}).and_return(@event.user)
    @event.should_not_receive(:add_google_info).with(@event.user.access_token)

    EventInitial.perform(@event.id.to_s)

    @event.reload.state.should == 'travel_nodes_progress'
  end


  it 'should change state when having an Exception' do
    @event_not_good = Factory(:event)
    @event_not_good.user_id = nil
    @event_not_good.save

    Event.should_receive(:first).with(conditions: {id: @event_not_good.id.to_s}).and_return(@event_not_good)

    EventInitial.perform(@event_not_good.id.to_s)

    @event_not_good.reload
    @event_not_good.state.should == 'error'
  end
end
