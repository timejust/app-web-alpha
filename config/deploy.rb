require 'bundler/capistrano'
require 'whenever/capistrano'
require 'capistrano/ext/multistage'
require 'capistrano-notification'

set :stages, %w(dev staging production)
set :default_stage, "dev"

# Common options
set :use_sudo,   false
set :scm,        :git
set :repository, "af83@git.af83.com:timejust-api.git"
set :deploy_via, :remote_cache
set :user,       "timejust"
set :application, "timejust-api"

set :whenever_command, "bundle exec whenever"
set :whenever_environment, defer { rails_env }

default_run_options[:pty] = true # Temporary hack

notification.irc do |irc|
  irc.host    'chat.freenode.net'
  irc.channel "#af83-#{user}"
  irc.message { "#{local_user} deployed #{application} on #{host} to #{deploy_to} (branch: #{branch})" }
end

task :ask_production_confirmation do
  set(:confirmed) do
    puts <<-WARN

========================================================================

WARNING: You're about to perform actions on production server(s)

========================================================================

WARN
    answer = Capistrano::CLI.ui.ask " Are you sure you want to continue? (Y) "
    answer == 'Y' ? true : false
  end

  unless fetch(:confirmed)
    puts "\nDeploy cancelled!"
    exit
  end
end
before 'production', :ask_production_confirmation

namespace :logs do
  desc "Watch jobs log"
  task :default do
    run "tail -f #{current_path}/log/#{rails_env}.log"
  end
end

namespace :thin do
  desc "Copy thin config"
  task :copy do
    upload "config/thin/#{rails_env}.yml", "#{shared_path}/thin.yml", :via => :scp
  end
end
after "deploy:setup", "thin:copy"

namespace :mongoid do
  desc "Copy mongoid config"
  task :copy do
    upload "config/mongoid/#{rails_env}.yml", "#{shared_path}/mongoid.yml", :via => :scp
  end
  task :symlink do
    run "ln -s #{shared_path}/mongoid.yml #{release_path}/config/mongoid.yml"
  end
end
after "deploy:setup", "mongoid:copy"
after "deploy:update_code", "mongoid:symlink"

# The hard-core deployment rules
namespace :deploy do
  task :start, :roles => :app do
    run "cd #{current_path} && bundle exec thin start -C #{shared_path}/thin.yml"
  end

  task :stop, :rules => :app do
    run "cd #{current_path} && bundle exec thin stop -C #{shared_path}/thin.yml"
  end

  task :restart, :roles => :app, :except => { :no_release => true }  do
    run "cd #{current_path} && bundle exec thin restart -C #{shared_path}/thin.yml"
  end
end

namespace :resque do
  desc "start resque queues"
  task :start do
    run "cd #{current_path} && bundle exec rake resque:pool:start"
  end
  desc "stop resque queues"
  task :stop do
    run "cd #{current_path} && bundle exec rake resque:pool:stop"
  end
  desc "restart resque queues"
  task :restart do
    run "cd #{current_path} && bundle exec rake resque:pool:restart"
  end
end

namespace :gadget do
  desc 'deploy gadget'
  task :deploy do
    upload "app/views/gadget/show.xml.haml", "#{current_path}/app/views/gadget/show.xml.haml", :via => :scp
    js_files = YAML.load_file('config/configatron_data/gadget.yml')[:all][:gadget][:js]
    js_files.each_pair do |key, value|
      value.each {|f| upload f, File.join(current_path, f), :via => :scp }
    end
  end
end

# Maintenance page
before 'deploy:update', 'deploy:web:disable'

after 'deploy:restart', 'deploy:web:enable'
after 'deploy:restart', 'deploy:cleanup'
#after 'deploy:update_code', 'resque:restart'
