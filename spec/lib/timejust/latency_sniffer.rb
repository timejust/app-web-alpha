# encoding: UTF-8
require 'spec_helper'

describe Timejust::LatencySniffer do

  it 'write a log now and 1 sec later' do
    # write a log now
    timer = Timejust::LatencySniffer.new('testing task')
    timer.start
    sleep 1
    timer.end
  end
  
  it 'write a log now and 1 sec later without additional text' do
    # write a log now
    timer = Timejust::LatencySniffer.new('testing task')
    timer.start
    sleep 1
    timer.end
  end
  
end
