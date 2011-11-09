require 'spec_helper'

describe NormalizedAddress do
  it{ should validate_presence_of(:formatted_address) }
  it{ should be_embedded_in(:travel_node) }
end
