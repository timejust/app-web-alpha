set     :branch,              "master"
set     :rails_env,           :staging
set     :host,                "timejust-staging.af83.com"
set     :default_environment, {"RAILS_ENV" => rails_env}
set     :deploy_to,           "/var/www/#{user}/#{rails_env}/timejust-api"
server  "#{user}@#{host}", :app, :web, :db, :primary => true
