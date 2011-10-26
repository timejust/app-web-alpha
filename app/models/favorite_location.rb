class FavoriteLocation
  include Mongoid::Document

  belongs_to :user
  field :address, type: String
  field :title,   type: String

  validates_presence_of :address
  validates_presence_of :title

  def self.create_from_travel_node(user, travel_node)
    favorite = FavoriteLocation.find_or_initialize_by(user_id: user.id, title: FavoriteLocation.format_title(travel_node.title))
    favorite.address = travel_node.address
    favorite.save
  end

  def self.format_title(title)
    title.strip!
    title = "@#{title}" unless title[0] == "@"
    title
  end
end
