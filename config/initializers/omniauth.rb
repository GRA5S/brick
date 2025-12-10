Rails.application.config.middleware.use OmniAuth::Builder do
    provider :openid_connect,
    name: :hackclub,
    scope: [ :openid, :profile, :email, :slack_id, :verification_status ],
    response_type: :code,
    discovery: true,
    issuer: "https://auth.hackclub.com",
    uid_field: "sub",
    client_options: {
      identifier:   ENV['HACKCLUB_CLIENT_ID'],
      secret:       ENV['HACKCLUB_CLIENT_SECRET'],
      redirect_uri: ENV['HACKCLUB_REDIRECT_URI']
    }
end
