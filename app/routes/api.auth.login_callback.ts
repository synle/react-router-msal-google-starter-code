import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import {
  getAuthAccessTokenFromCode as getAADAuthAccessTokenFromCode,
  getUserInfo as getAADUserInfo,
} from "~/utils/backend/SSO.AAD";
import {
  getAuthAccessTokenFromCode as getGoogleAuthAccessTokenFromCode,
  getUserInfo as getGoogleUserInfo
} from "~/utils/backend/SSO.Google";
import { commitSession, getSession } from "~/utils/backend/Session";

export async function loader({ request }: LoaderFunctionArgs) {
  // for Google login as it's a GET
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ||'';
  const scope = url.searchParams.get("scope") ||'';
  const authuser = url.searchParams.get("authuser") ||'';
  const prompt = url.searchParams.get("prompt") ||'';
  const state = url.searchParams.get("state") ||'';

  const redirectUri = state || "";

  try {
    const response = await getGoogleAuthAccessTokenFromCode(redirectUri, code);
    const tokens = response.tokens;

    const user = await getGoogleUserInfo(tokens.access_token || '');
    console.log(user);
    return user
  } catch (err) {
    console.log(err)
    // return redirect('/');
    return new Response(`Failed to authenticate - ${err}`, {
      status: 400,
    });
  }
}


export async function action({ request }: ActionFunctionArgs) {
  // for AAD login as it's a POST
  const formData = new URLSearchParams(await request.text());

  try {
    const redirectUri = formData.get("state") || "";

    const response = await getAADAuthAccessTokenFromCode(redirectUri, {
      code: formData.get("code") || "",
      client_info: formData.get("client_info") || "",
      session_state: formData.get("session_state") || "",
    });

    const { accessToken } = response;
    const me = await getAADUserInfo(accessToken);

    // set cookies
    const session = await getSession(request.headers.get("Cookie"));
    session.set("access_token", accessToken);
    session.set("me", me);

    return redirect(`/`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (err) {
    return new Response(`Failed to authenticate - ${err}`, {
      status: 400,
    });
  }
}
