set     :user,                "deploy"
set     :runner,              "deploy"
set     :branch,              "staging"
set     :rails_env,           "staging"
set     :host,                "timejust-staging.af83.com"
set     :default_environment, {"RAILS_ENV" => rails_env}
set     :deploy_to,           "/var/www/app-web-alpha"

role :app,          "staging.timejust.com"
role :web,          "staging.timejust.com"
role :job,          "staging.timejust.com"
role :notification, "staging.timejust.com"

# Hudsons key
ssh_options[:keys] = %w(/home/hudson/.ssh/id_rsa)

default_environment["PATH"] = "$PATH:/usr/local/lib/ruby/gems/1.9.1/bin/"
