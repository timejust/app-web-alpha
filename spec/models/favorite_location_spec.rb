require 'spec_helper'

describe FavoriteLocation do
  it{ should belong_to(:user).of_type(User) }
  it{ should validate_presence_of :address }
  it{ should validate_presence_of :title }

  describe "#create_from_travel_node" do
    let(:user) { Factory :user }
    it "should create if title not exists for this user" do
      user.favorite_locations.destroy_all
      FavoriteLocation.create_from_travel_node(user, TravelNode.new(address: "My Address", title: "@home"))
      user.reload
      user.favorite_locations.count.should == 1
      user.favorite_locations.first.title.should == "@home"
      user.favorite_locations.first.address.should == "My Address"
    end

    it "should update if title exists for this user" do
      user.favorite_locations.destroy_all
      FavoriteLocation.create(user: user.id, address: "My Address", title: "@home")
      user.reload
      user.favorite_locations.count.should == 1
      user.favorite_locations.first.title.should == "@home"
      user.favorite_locations.first.address.should == "My Address"
      FavoriteLocation.create_from_travel_node(user, TravelNode.new(address: "My Updated Address", title: "@home"))
      user.reload
      user.favorite_locations.count.should == 1
      user.favorite_locations.first.title.should == "@home"
      user.favorite_locations.first.address.should == "My Updated Address"
    end

  end

  describe 'format_title' do

    it "should remove spaces and add @" do
      FavoriteLocation.format_title(' test ').should == ('@test')
    end
  end
end
