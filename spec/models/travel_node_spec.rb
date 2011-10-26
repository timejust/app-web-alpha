# encoding: utf-8
require 'spec_helper'

describe TravelNode do
  it{ should validate_presence_of(:address) }
  it{ should be_embedded_in(:event) }
  it{ should embed_many(:normalized_addresses) }

  describe "#normalize" do

    let(:event) {
      event = Factory :event
      event.create_current_travel_node(address: "15 rue poisonnières, Paris")
      event
    }

    it "should normalize unconfirmed address" do
      event.current_travel_node.update_attribute(:state, 'unconfirmed')
      Timejust::NormalizeAddresses.should_receive(:new).with(event.current_travel_node)
      event.current_travel_node.normalize
    end

    it "should not normalize confirmed address" do
      event.current_travel_node.update_attribute(:state, 'confirmed')
      Timejust::NormalizeAddresses.should_not_receive(:new)
      event.current_travel_node.normalize
    end

  end
end
