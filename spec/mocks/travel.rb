#encoding: utf-8
def mock_travel(stubs={})
  mock = mock_model(Travel, stubs)
  mock.stub!(:id).and_return("47cc67093475061e3d95369d")
  mock.stub!(:to_json).and_return(mock_travel_json)
  mock
end

def mock_travel_json
  {}.to_json
end
