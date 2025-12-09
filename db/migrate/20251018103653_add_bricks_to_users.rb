class AddBricksToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :bricks, :integer
  end
end
