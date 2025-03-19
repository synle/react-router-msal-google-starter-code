import axios from "axios";
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { SCOPE, confidentialClientApplication } from "~/utils/backend/SSO";
import { commitSession, getSession } from "~/utils/backend/Session";

async function _getUserInformation(accessToken: string) {
  // do the me api to get profile
  const { data: aadMeProfile } = await axios.get(
    `https://graph.microsoft.com/v1.0/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    },
  );

  return aadMeProfile;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = new URLSearchParams(await request.text());

  try {
    const url = new URL(request.url);
    const redirectUri = process.env.AAD_REDIRECT_URL
      ? process.env.AAD_REDIRECT_URL
      : formData.get("state") || "";

    const response = await confidentialClientApplication.acquireTokenByCode({
      scopes: SCOPE,
      redirectUri,
      ...{
        code: formData.get("code") || "",
        client_info: formData.get("client_info") || "",
        session_state: formData.get("session_state") || "",
      },
    });

    const { accessToken } = response;
    const me = await _getUserInformation(accessToken);

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
