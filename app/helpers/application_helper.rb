module ApplicationHelper
  def img64(image, h=0, v=0)
    "background: url('data:image/png;base64," + ActiveSupport::Base64.encode64(open(File.join(Rails.root, image)).read).gsub(/[\r\n]+/, '') + "') #{h} #{v} no-repeat;"
  end

  def gadget_title
    title = 'Timejust'
    unless Rails.env == 'production'
      title << " #{Rails.env}"
    else
      title
    end
  end
end
