# encoding: UTF-8
require 'spec_helper'
require 'configatron'

describe Timejust::Calendars do
  before do
    @user = build(:user) 
    @valid_refresh_token = "1/etTPsxfNvt5KnVzUpQMSGZOKCdMkmvUXTY-UOec10LQ"
    @invalid_refresh_token = "1/VZSpvdZEaHQtpWK8J1MjhiKtuJsMrbnVujSaxUo"
    @test_email_for_calendar = "minsik.kim@groupe-stone.fr"
    configatron.service.http.url = "http://service-staging.timejust.com"    
  end
  
  it 'sync calendar with valid refresh token' do    
    resp = CalendarsStub.stub_sync(@test_email_for_calendar,
                                   @valid_refresh_token,
                                   Timejust::Calendars::GOOGLE_CALENDAR)
    resp.status.should == Timejust::Service::OK
    resp.message.should == "ok"
  end
  
  it 'sync calendar with invalid refresh token' do
    resp = CalendarsStub.stub_sync_with_invalid_token(@test_email_for_calendar,
                                                      @invalid_refresh_token,
                                                      Timejust::Calendars::GOOGLE_CALENDAR)
    resp.status.should == Timejust::Service::NOT_FOUND
    resp.message.should == "not_found"
  end

  it 'sync calendar with unsupport calendar type' do
    resp = CalendarsStub.stub_sync_with_invalid_calendar(@test_email_for_calendar,
                                                         @valid_refresh_token,
                                                         "")    
    resp.status.should == Timejust::Service::BAD_REQUEST
    resp.message.should == "bad_request"    
  end  
  
  it 'insert new event to calendar service' do
    event = {
      :calendar_id => "groupe-stone.fr_9ptjijl66curia4sbvjk8616d4@group.calendar.google.com",
      :start => 1333542000,
      :end => 1333544000,
      :lat => 0.0,
      :lng => 0.0,
      :location => "26 rue de longchamp, Neuilly Sursene",
      :summary => "testing",
      :description => "testing purpose"      
    }
    resp = CalendarsStub.stub_insert_event(event, 
                                           @valid_refresh_token, 
                                           Timejust::Calendars::GOOGLE_CALENDAR)
    resp.status.should == Timejust::Service::OK
    resp.message.should == "ok"                                        
  end
  
end