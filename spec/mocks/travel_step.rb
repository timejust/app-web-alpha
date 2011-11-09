#encoding: utf-8
def mock_travel_step(stubs={})
  mock = mock_model(TravelStep, stubs)
  mock.stub!(:id).and_return("47cc67093475061e3d95369d")
  mock.stub!(:to_json).and_return(mock_travel_step_json)
  mock
end

def mock_travel_step_json
  {}.to_json
end
