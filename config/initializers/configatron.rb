# encoding: utf-8
require 'yaml'
require 'erb'

# Load configuration files in /config/configatron_data
#
# Each configuration file can be a plain YAML (*.yml)
# or an ERB template for a YAML document (*.yml.erb)
#
#   * :all           for default settings applicable all hosts and environments
#
#   * #{RAILS_ENV}   when you want to override the global settings with
#                    settings specific to the development, cdp, production ...
#                    environment
#   * `hostname`     when you want to customize your configuration down to
#                    host-specific settings
#
#   * You can also provide a :"`hostname -f`-RAILS_ENV" root key for very specific
#     settings (eg: :"snowflake.bearstech.com-cdp" for operaonline-dev.af83.com)
#
#
# @see http://github.com/markbates/configatron/ for more info on configatron

if File.exists? "#{Rails.root}/config/configatron_data"
  Dir["#{Rails.root}/config/configatron_data/**/*.{yml,yml.erb}"].sort.each do |f|
    values = YAML.load(ERB.new(File.read(f), 0, '<>%-').result)
    configatron.configure_from_hash values[:all]
    configatron.configure_from_hash values[Rails.env.to_sym]
    configatron.configure_from_hash values[Rails.env.to_s]
    configatron.configure_from_hash values[`hostname -f`.chomp.to_sym]
    configatron.configure_from_hash values["#{`hostname -f`.chomp}-#{Rails.env}".to_sym]
  end

end

