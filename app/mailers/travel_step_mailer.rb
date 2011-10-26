class TravelStepMailer < ActionMailer::Base
  default from: "plan@timejust.com"

  def invitation(travel_step)
    attachments['invite.ics'] = {
      mime_type: 'text/calendar',
      content: travel_step.to_ics
    }
    mail(
      subject: travel_step.invitation_subject,
      to: travel_step.user.email
    )
  end
end
