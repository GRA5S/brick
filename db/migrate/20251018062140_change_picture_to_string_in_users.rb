class ChangePictureToStringInUsers < ActiveRecord::Migration[8.0]
  def change
    change_column :users, :picture, :string
  end
end
