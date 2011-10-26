require File.join(File.dirname(__FILE__), 'config', 'environment')
require 'resque/server'

run Rack::URLMap.new "/resque" => Resque::Server.new
