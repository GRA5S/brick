class MainController < ApplicationController
  def index
    @users = User.all
    @you = current_user.display_name
  end
end
