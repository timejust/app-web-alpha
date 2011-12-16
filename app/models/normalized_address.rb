# encoding: UTF-8
class NormalizedAddress
  include Mongoid::Document

  field :formatted_address,  type: String
  field :lat,                type: Float
  field :lng,                type: Float

  embedded_in :travel_node

  validates_presence_of :formatted_address
  validates_uniqueness_of :formatted_address
end
