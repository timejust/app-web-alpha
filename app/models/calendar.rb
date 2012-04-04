# encoding: utf-8
class Calendar
  include Mongoid::Document

  field :google_short_id, type: String
  field :google_id,       type: String
  field :name,            type: String
  field :color,           type: String
  field :color_id,        type: String
  embedded_in :user

  validates_presence_of :google_id, :name, :color
end
