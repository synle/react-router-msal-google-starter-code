import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { getLoginCallbackUrl } from "~/utils/backend/SSO";

// configs for SSO
export const BASE_API_HOST = process.env.AAD_BASE_HOST_URL;

export const SCOPE = [
  "https://www.googleapis.com/auth/gmail.readonly", // Read Gmail messages
  "https://www.googleapis.com/auth/userinfo.email", // Access email address
  "openid", // OpenID authentication
];

const credentials = {
  client_id: process.env["GOOGLE_SSO_CLIENT_ID"] ?? "",
  client_secret: process.env["GOOGLE_SSO_CLIENT_VALUE"] ?? "",
  redirect_uris: [process.env["GOOGLE_BASE_HOST_URL"]],
  auth_uri:
    process.env["GOOGLE_SSO_AUTH_URI"] ||
    "https://accounts.google.com/o/oauth2/auth",
  token_uri:
    process.env["GOOGLE_SSO_TOKEN_URI"] ||
    "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url:
    process.env["GOOGLE_SSO_AUTH_PROVIDER_X509_CERT_URL"] ||
    "https://www.googleapis.com/oauth2/v1/certs",
};

export async function getLoginUrl(
  requestUrl: string,
  scope = SCOPE,
  access_type = "offline",
) {
  const redirectUri = getLoginCallbackUrl(requestUrl, BASE_API_HOST);
  const oAuth2Client = new OAuth2Client(
    credentials.client_id,
    credentials.client_secret,
    redirectUri,
  );
  return oAuth2Client.generateAuthUrl({
    access_type,
    scope,
    state: redirectUri,
  });
}

export async function getAuthAccessTokenFromCode(
  redirectUri: string,
  code: string,
) {
  const oAuth2Client = new OAuth2Client(
    credentials.client_id,
    credentials.client_secret,
    redirectUri,
  );

  return oAuth2Client.getToken(code);
}

export async function getUserInfo(accessToken: string) {
  const oAuth2Client = new OAuth2Client(
    credentials.client_id,
    credentials.client_secret,
  );

  oAuth2Client.setCredentials(accessToken);

  const gmail = google.gmail({
    version: "v1",
    auth: oAuth2Client,
  });

  return gmail.users.getProfile({
    userId: 'me'
  });
}
