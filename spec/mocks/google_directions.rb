# encoding: UTF-8
def mock_google_directions
  gg = mock('GoogleDirections')
  gg.stub!(:drive_time_in_minutes).and_return(42)
  gg.stub!(:xml_call).and_return('https://maps.googleapis.com/maps/api/directions/xml?language=en&alternative=true&origin=15+rue+poissoniere+75002&destination=71+rue+jean+jaures+92300&sensor=false')
  gg.stub!(:public_url).and_return('https://maps.google.com/maps?saddr=15+Rue+Poissonnière%2C+75002+Paris%2C+France&daddr=Quai+de+la+Rapée%2C+75012+Paris%2C+France&hl=en&ie=UTF8')
  gg.stub!(:steps).and_return(['1', '2'])
  gg.stub!(:distance).and_return(42)
  gg
end
