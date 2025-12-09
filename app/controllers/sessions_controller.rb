class SessionsController < ApplicationController
  def create
    auth = request.env["omniauth.auth"]
    provider = auth.provider
    uid = auth.uid
    info = auth.info
    cred = auth.credentials

    puts info
    puts cred
    puts uid
    if provider == :hackclub && current_user.blank?
      user = User.find_or_initialize_by(uid: uid)
      user.access_token = cred.token
      user.refresh_token = cred.refresh_token if cred.refresh_token.present?
      user.display_name = info.name
      user.email = info.email
      user.picture = info.image
      user.uid = uid
      user.bricks = 0 if user.bricks.nil?
      user.save!
      puts cred.slack_id
      puts "hi"
      reset_session
      session[:user_id] = user.id
      redirect_to "/main", notice: "Signed in with Slack"
      nil
    else
      redirect_to "/main"
    end
  end

  def destroy
    reset_session
    redirect_to "/", notice: "Signed out"
  end

  def failure
    redirect_to "/", alert: "Authentication failed"
  end
end
