import type { Credentials } from "google-auth-library";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { getLoginCallbackUrl } from "~/utils/backend/SSO";

interface UserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

// configs for SSO
export const BASE_API_HOST = process.env.AAD_BASE_HOST_URL;

export const SCOPE = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
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

export async function getUserInfo(tokens: Credentials) {
  const oAuth2Client = new OAuth2Client(
    credentials.client_id,
    credentials.client_secret,
  );
  oAuth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: oAuth2Client,
    version: "v2",
  });

  return (await oauth2.userinfo.get()).data as UserInfo;
}
