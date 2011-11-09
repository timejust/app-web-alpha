# encoding: UTF-8
require 'spec_helper'

describe Timejust::LatencySniffer do

  it 'write a log now and 1 sec later' do
    # write a log now
    Timejust::LatencySniffer.new('testing task', '00010', 'starting task')
    sleep 1
    Timejust::LatencySniffer.new('testing task', '00010', 'ended task')
  end
  
  it 'write a log now and 1 sec later without additional text' do
    # write a log now
    Timejust::LatencySniffer.new('testing task', '00010')
    sleep 1
    Timejust::LatencySniffer.new('testing task', '00010')
  end
  
end
