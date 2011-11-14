class TravelStepMailer < ActionMailer::Base
  default from: "plan@timejust.com"

  def invitation(travel_step)
    ics = travel_step.to_ics
    attachments['invite.ics'] = {
      mime_type: 'application/ics',
      content: ics
    }
    #part: content_type => 'text/calendar'
    #attachments['meeting.ics'] = {
    #  mime_type: 'text/calendar; method=REQUEST; name=meeting.ics',
    #  content: ics,
    #}
    #part :content_type => 'multipart/alternative' do |copy|
    #  copy.part :content_type => 'text/calendar; method=REQUEST; name=meeting.ics' do |plain|
    #    plain.body = ics
    #  end
    #end
    
    mail(
      subject: travel_step.invitation_subject,
      to: travel_step.user.email) do |format|
        format.text(:content_type => 'text/calendar; method=REQUEST; name=meeting.ics',
                   'Content-Transfer-Encoding' => '7bit') {
          render :text => ics
        }        
        format.html { render 'invitation' }
    end      
    #end
  end
end
