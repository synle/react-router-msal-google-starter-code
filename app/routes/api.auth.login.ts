import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getLoginUrl } from "~/utils/backend/SSO.AAD";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const mode = (url.searchParams.get("mode") || "aad").toLowerCase();

  try {
    switch (mode) {
      case "aad":
      default:
        return redirect(await getLoginUrl(request.url));
    }
  } catch (err) {
    return new Response(`Failed to log in - mode=${mode} - ${err}`, {
      status: 400,
    });
  }
}
