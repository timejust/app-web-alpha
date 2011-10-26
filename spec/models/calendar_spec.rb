require 'spec_helper'

describe Calendar do
  it{ should be_embedded_in(:user) }
  it{ should validate_presence_of(:google_id) }
  it{ should validate_presence_of(:name) }
  it{ should validate_presence_of(:color) }
end
