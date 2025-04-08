import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import {
  getAuthAccessTokenFromCode as getAADAuthAccessTokenFromCode,
  getUserInfo as getAADUserInfo,
} from "~/utils/backend/SSO.AAD";
import { commitSession, getSession } from "~/utils/backend/Session";

export async function action({ request }: ActionFunctionArgs) {
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
