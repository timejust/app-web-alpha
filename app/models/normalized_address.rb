# encoding: UTF-8
class NormalizedAddress
  include Mongoid::Document

  field :address_components, type: Array
  field :formatted_address,  type: String
  field :geometry,           type: Hash
  field :partial_match,      type: Boolean
  field :types,              type: Array

  embedded_in :travel_node

  validates_presence_of :formatted_address
  validates_uniqueness_of :formatted_address
end
