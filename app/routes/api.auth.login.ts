import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import {
  BASE_API_HOST,
  LOGIN_CALLBACK_URL,
  SCOPE,
  confidentialClientApplication,
} from "~/utils/backend/SSO";

export async function loader({ request }: LoaderFunctionArgs) {
  let redirectUri = "";
  if (BASE_API_HOST) {
    redirectUri = BASE_API_HOST;
  } else {
    try {
      const url = new URL(request.url);
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
    return redirect(loginUrl);
  } catch (err) {
    return new Response(`Failed to log in - ${err}`, {
      status: 400,
    });
  }
}
