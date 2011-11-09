# encoding: UTF-8
module Timejust
  class LatencySniffer
    def initialize(task, event_id, text = '')
      Rails.logger.info "[#{task}][#{event_id}][#{text}][#{Time.now.to_f}]"
    end
  end
end
