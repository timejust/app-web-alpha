source :rubygems
# source 'http://gems:Nasom4@gems.af83.com/'

gem 'rails', '3.1.0'

# Bundle edge Rails instead:
# gem 'rails',     :git => 'git://github.com/rails/rails.git'

# database
gem 'mongoid'
gem 'bson_ext'

# Configuration
gem 'configatron'

# User managment
gem 'devise'
gem 'omniauth', "0.3.2"
gem 'oauth2', "~> 0.5.2"

# Models
gem 'state_machine'

# Asset template engines
gem 'sass-rails'
gem 'coffee-script'
gem 'uglifier'
gem 'haml'
gem 'haml-rails'
gem 'sass'
gem "therubyracer", :require => 'v8' # Embed the V8 Javascript Interpreter

# Smart forms
gem 'simple_form'

gem 'jquery-rails'

# web server
gem 'thin'

# Deploy with Capistrano
gem 'capistrano'

gem "faraday", "~> 0.7.6"

# Cron jobs in Ruby
gem 'whenever',         '~>0.6.8', :require => false

# redis resque & co
gem 'resque',           '~>1.19.0', :require => 'resque/server',
  :git => 'git://github.com/spk/resque.git', :branch => 'blocking_reserve'
gem 'resque-pool',      :git => "git://github.com/spk/resque-pool.git", :branch => "improve_tasks" # resque pool workers
gem "redis-namespace",  '1.0.3', :require => false

# http client
gem 'typhoeus', '~>0.2.4'

# string cleaner
gem 'utf8proc', '~>1.1.5'
gem 'sanitize', '~>2.0.3'

# faster json
gem 'yajl-ruby', '~>0.8.2', :require => 'yajl/json_gem'

# google calendar
gem 'google-api-client', "~> 0.4.2"

# gem 'ratp-api-ruby', '~>0.2.0'

gem 'icalendar'

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'

group :development do
  gem 'guard'
  gem 'guard-rspec'
  gem 'rb-inotify' if Config::CONFIG['host_os'] =~ /linux/i # wrapper for Linux's inotify, using FFI
  gem 'libnotify', '~>0.3.0' if Config::CONFIG['host_os'] =~ /linux/i
  gem 'capistrano'
  gem 'capistrano-ext'
  gem 'capistrano-notification'
  gem 'jasmine' # usefull for rake tasks
end

group :test do
  # Pretty printed test output
  gem 'turn', :require => false
  gem 'rspec-rails'
  gem 'mongoid-rspec'
  gem 'factory_girl_rails'
  gem 'ffaker'
  gem 'rails3-generators' # usefull for factory girl default generator
  gem 'jasmine'
  gem 'jasmine-headless-webkit'
  gem 'email_spec'
  gem 'simplecov'
  gem 'webmock',              '1.6.2'
end
