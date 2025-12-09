Rails.application.config.middleware.use OmniAuth::Builder do
    provider :openid_connect,
    name: :hackclub,
    scope: [ :openid, :profile, :email, :slack_id, :verification_status ],
    response_type: :code,
    discovery: true,
    issuer: "https://auth.hackclub.com",
    uid_field: "sub",
    client_options: {
      identifier:   Rails.application.credentials.dig(:hackclub, :client_id),
      secret:       Rails.application.credentials.dig(:hackclub, :client_secret),
      redirect_uri: Rails.application.credentials.dig(:hackclub, :redirect_uri)
    }
end
