class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :display_name
      t.string :email
      t.string :access_token
      t.string :refresh_token
      t.string :uid

      t.timestamps
    end
  end
end
