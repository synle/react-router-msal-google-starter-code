import type { AuthorizationCodeRequest } from "@azure/msal-node";
import { ConfidentialClientApplication } from "@azure/msal-node";

// configs for SSO
export const BASE_API_HOST = process.env.AAD_BASE_HOST_URL;
export const LOGIN_URL = "/api/auth/login";
export const LOGIN_CALLBACK_URL = "/api/auth/login_callback";

const TENANT_ID = process.env["AAD_SSO_TENANT_ID"] ?? "common";
const CLIENT_ID = process.env["AAD_SSO_CLIENT_ID"] ?? "";
const AUTHORITY = `https://login.microsoftonline.com/${TENANT_ID}`;
export const CLIENT_SECRET = process.env["AAD_SSO_CLIENT_VALUE"] ?? "";
export const SCOPE = ["user.read"];

// Load certificate credentials
/**
 * Certificate Thumbprint
 *
 * openssl x509 -in <certicate>.txt -noout -fingerprint -sha1 | sed 's/.*=//;s/://g'
 */
const CERT_THUBMPRINT = (process.env["AAD_SSO_CERT_THUBMPRINT"] ?? "").trim();
/**
 * Private Key in PKCS8 format
 *
 * openssl pkcs8 -topk8 -nocrypt -in <private_key>.txt
 */
const CERT_PRIVATE_KEY = (process.env["AAD_SSO_CERT_PRIVATE_KEY"] ?? "").trim();

const msalConfigs = {
  auth: {
    clientId: CLIENT_ID,
    authority: AUTHORITY,
  },
};

// setting up auth mode
if (CERT_THUBMPRINT.length === 40 && CERT_PRIVATE_KEY) {
  // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/certificate-credentials.md
  //@ts-ignore
  msalConfigs.auth["clientCertificate"] = {
    thumbprint: CERT_THUBMPRINT,
    privateKey: CERT_PRIVATE_KEY,
  };
} else if (CLIENT_SECRET) {
  //@ts-ignore
  msalConfigs.auth["clientSecret"] = CLIENT_SECRET;
} else {
  console.log("AAD Configs missing either `clientSecret` or `certificate`");
}

// msal init
export const confidentialClientApplication = new ConfidentialClientApplication(
  msalConfigs,
);

export async function getLoginUrl(requestUrl: string) {
  let redirectUri = "";
  if (BASE_API_HOST) {
    redirectUri = BASE_API_HOST;
  } else {
    try {
      const url = new URL(requestUrl);
      redirectUri = process.env.AAD_REDIRECT_URL
        ? process.env.AAD_REDIRECT_URL
        : url.host.includes("localhost")
          ? `${url.protocol}//${url.host}`
          : `https://${url.host}`;
    } catch (err) {}
  }

  redirectUri = `${redirectUri}${LOGIN_CALLBACK_URL}`;

  try {
    const loginUrl = await confidentialClientApplication.getAuthCodeUrl({
      scopes: SCOPE,
      redirectUri,
      state: redirectUri,
      prompt: "select_account",
      responseMode: "form_post", // use a POST instead
    });
    return loginUrl;
  } catch (err) {
    throw "Failed to construct Login URL";
  }
}

export async function getAuthAccessTokenFromCode(
  redirectUri: string,
  params: AuthorizationCodeRequest,
) {
  params.scopes = params.scopes ?? SCOPE;
  params.redirectUri = redirectUri;

  return confidentialClientApplication.acquireTokenByCode(params);
}
