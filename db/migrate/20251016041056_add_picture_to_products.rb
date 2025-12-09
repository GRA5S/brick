class AddPictureToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :picture, :string
  end
end
