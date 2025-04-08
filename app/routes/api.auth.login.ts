import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getLoginUrl as getAADLoginUrl } from "~/utils/backend/SSO.AAD";
import { getLoginUrl as getGoogleLoginUrl } from "~/utils/backend/SSO.Google";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const mode = (url.searchParams.get("mode") || "aad").toLowerCase();

  try {
    switch (mode) {
      case "google":
        return redirect(await getGoogleLoginUrl(request.url));
      case "aad":
      default:
        return redirect(await getAADLoginUrl(request.url));
    }
  } catch (err) {
    return new Response(`Failed to log in - mode=${mode} - ${err}`, {
      status: 400,
    });
  }
}
