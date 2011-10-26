class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController

  # Callback for google apps
  def openid
    @user = User.find_for_openid(env["omniauth.auth"], current_user)
    if @user.persisted?
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Google"
      sign_in_and_redirect @user, :event => :authentication
    else
      session["devise.open:id_data"] = env["openid.ext1"]
      redirect_to new_user_registration_url
    end
  end

  def failure
    flash[:alert] = "Unable to sign in #{failed_strategy.inspect} : #{failure_message}"
    redirect_to root_path
  end
end
