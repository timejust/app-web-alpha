require 'resque'

$redis = Redis.new(
  :host => configatron.redis.server.host,
  :port => configatron.redis.server.port,
  :thread_safe => true
)

Resque.redis = [configatron.redis.server.host, configatron.redis.server.port].join(':')
Resque.redis.namespace = [ configatron.redis.server.namespace, configatron.redis.services.resque.namespace  ].join(':')
