# encoding: UTF-8
require 'utf8proc'

class String
  # Replace accentend characters with their unaccented versions
  def unistrip
    self.strip.utf8map(:compose, :casefold, :rejectna, :stripmark, :ignore, :stripcc, :compat)
  end
end
