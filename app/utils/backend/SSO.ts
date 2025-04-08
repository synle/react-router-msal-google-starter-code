export const LOGIN_CALLBACK_URL = "/api/auth/login_callback";

export function getLoginCallbackUrl(
  requestUrl: string,
  targetRedirectUri?: string,
) {
  let redirectUri = "";
  if (targetRedirectUri) {
    redirectUri = targetRedirectUri;
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
  return redirectUri;
}
