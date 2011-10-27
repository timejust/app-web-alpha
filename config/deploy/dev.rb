# cap deploy -s branch=<GIT_BRANCH>
b = exists?(:branch) ? branch : 'develop'
set     :branch,              b
set     :rails_env,           :dev
set     :host,                "timejust-dev.af83.com"
set     :default_environment, {"RAILS_ENV" => rails_env}
set     :deploy_to,           "/var/www/#{user}/#{rails_env}/timejust-api"
server  "#{user}@#{host}", :app, :web, :db, :primary => true
