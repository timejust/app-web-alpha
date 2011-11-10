# encoding: UTF-8
def mock_ratp_itinerary(opts={})
  ratp = mock('RATP::Itinerary', opts)
  ratp.stub!(:duration).and_return(42) if opts[:duration].blank?
  ratp.stub!(:url).and_return('http://wap.ratp.fr/siv/itinerary-list?datehour=13&dateminute=20&datestart=false&name1=quai+de+la+rapee+paris-12eme&name2=15+rue+poissonniere+paris-02eme&reseau=all&traveltype=plus_rapide&type1=adresse&type2=adresse')
  ratp.stub!(:departure_hour).and_return(Time.now.strftime('%H:%M')) if opts[:departure_hour].blank?
  ratp.stub!(:departure_time).and_return(Time.now)
  ratp.stub!(:arrival_time).and_return(15.minutes.from_now) if opts[:arrival_time].blank?
  ratp.stub!(:travel_formated).and_return(['1', '2'])
  ratp.stub!(:valid?).and_return(true)
  ratp.stub!(:transports).and_return(%w{metro rer})
  ratp.stub!(:summary).and_return(%w{metro14 rerA})
  ratp.stub!(:steps_count).and_return(3)
  ratp
end
