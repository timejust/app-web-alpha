# encoding: utf-8
class Api::VersionController < Api::BaseController
  def show
    render :text => "1"
  end
end
