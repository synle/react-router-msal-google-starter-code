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
const CERT_THUBMPRINT = (process.env["AAD_SSO_CERT_THUBMPRINT"] ?? "").trim();
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
