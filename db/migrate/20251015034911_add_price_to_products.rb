class AddPriceToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :price, :decimal
  end
end
