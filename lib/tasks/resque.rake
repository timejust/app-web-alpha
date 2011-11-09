require 'resque/pool/tasks'

namespace :resque do
  namespace :pool do
    desc 'start forground'
    task :start_fg => %w[resque:setup resque:pool:setup] do
      Resque::Pool.run
    end

    desc 'resque pool restart'
    task :restart do
      Rake.application["resque:pool:stop"].invoke
      sleep 2
      Rake.application["resque:pool:start"].invoke
    end
  end
end
