require 'spec_helper'

describe Google::Request do

  let (:access_token) {
    mock_oauth2_access_token
  }

  describe "self.headers" do

    it "should use default headers" do
      Google::Request.headers.should == {'Content-Type' => "application/json", 'GData-Version' => "2"}
    end

    it "should use custom headers" do
      default_format = Google::Request.format
      default_version = Google::Request.version
      Google::Request.format = "application/atom+xml"
      Google::Request.version = "1"
      Google::Request.headers.should == {'Content-Type' => "application/atom+xml", 'GData-Version' => "1"}
      Google::Request.format = default_format
      Google::Request.version = default_version
    end

  end

  describe "self.post" do

    it "should perform POST request" do
      Google::Request.should_receive(:request).with(
        :post,
        access_token,
        "http://fake.google.com/request",
        Google::Request.format_params({:foo => :bar})
      )
      Google::Request.post(access_token, "http://fake.google.com/request", {:foo => :bar})
    end

  end

  describe "self.put" do

    it "should perform PUT request" do
      Google::Request.should_receive(:request).with(
        :put,
        access_token,
        "http://fake.google.com/request",
        Google::Request.format_params({:foo => :bar})
      )
      Google::Request.put(access_token, "http://fake.google.com/request", {:foo => :bar})
    end

  end

  describe "self.get" do

    it "should perform GET request" do
      Google::Request.should_receive(:request).with(
        :get,
        access_token,
        Google::Request.format_url("http://fake.google.com/request"),
        {:foo => :bar}

      )
      Google::Request.get(access_token, "http://fake.google.com/request", {:foo => :bar})
    end

  end

  describe "self.delete" do

    it "should perform DELETE request" do
      Google::Request.should_receive(:request).with(
        :delete,
        access_token,
        Google::Request.format_url("http://fake.google.com/request"),
        {:foo => :bar},
        Google::Request.headers.merge('If-Match' => "*")
      )
      Google::Request.delete(access_token, "http://fake.google.com/request", {:foo => :bar})
    end

  end

  describe "self.request" do

    context "as application/json format" do
      before :each do
        Google::Request.format = "application/json"
      end

      it "should perform POST request using access_token" do
        access_token.should_receive(:post).with(
          "http://fake.google.com/request",
          {:data => {:foo => :bar}}.to_json,
          Google::Request.headers
        )
        Google::Request.post(access_token, "http://fake.google.com/request", {:foo => :bar})
      end

      it "should perform PUT request using access_token" do
        access_token.should_receive(:put).with(
          "http://fake.google.com/request",
          {:data => {:foo => :bar}}.to_json,
          Google::Request.headers
        )
        Google::Request.put(access_token, "http://fake.google.com/request", {:foo => :bar})
      end

      it "should perform GET request using access_token" do
        access_token.should_receive(:get).with(
          Google::Request.format_url("http://fake.google.com/request"),
          {:foo => :bar},
          Google::Request.headers
        )
        Google::Request.get(access_token, "http://fake.google.com/request", {:foo => :bar})
      end

      it "should perform DELETE request using access_token and add If-Match: * header" do
        access_token.should_receive(:delete).with(
          Google::Request.format_url("http://fake.google.com/request"),
          {:foo => :bar},
          Google::Request.headers.merge('If-Match' => "*")
        )
        Google::Request.delete(access_token, "http://fake.google.com/request", {:foo => :bar})
      end
    end

  end

  describe "self.format_params" do

    context "as application/json format" do
      before :each do
        Google::Request.format = "application/json"
      end

      it "should add 'data' as json root node" do
        Google::Request.format_params({:foo => :bar}).should == {:data => {:foo => :bar}}.to_json
      end

    end

  end

end
