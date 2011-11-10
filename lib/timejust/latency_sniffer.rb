# encoding: UTF-8
module Timejust
  class LatencySniffer
    def initialize(task)
      @task = task
      @id = (Time.now.to_f * 10000) - 13000000000000 
    end
    
    def start
      Rails.logger.info "[#{@task}][#{@id}][started][#{Time.now.to_f}]"
    end
    
    def end
      Rails.logger.info "[#{@task}][#{@id}][ended][#{Time.now.to_f}]"
    end
  end
end
