require "test_helper"

class MasonryControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get masonry_index_url
    assert_response :success
  end
end
