set   :user,                "deploy"
set   :runner,              "deploy"
set   :branch,              "production"
set   :rails_env,           "production"
set   :host,                "beta.timejust.com"
set   :default_environment, {"RAILS_ENV" => rails_env}
set   :deploy_to,           "/var/www/app-web-alpha"

role  :app,                 "beta.timejust.com"
role  :web,                 "beta.timejust.com"
role  :job,                 "beta.timejust.com"
role  :notification,        "beta.timejust.com"

# Hudsons key
ssh_options[:keys] = %w(/home/hudson/.ssh/id_rsa)

default_environment["PATH"] = "$PATH:/usr/local/lib/ruby/gems/1.9.1/bin/"
