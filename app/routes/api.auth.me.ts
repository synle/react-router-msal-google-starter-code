import type { LoaderFunctionArgs } from "react-router";
import { getSession } from "~/utils/backend/Session";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSession(request.headers.get("Cookie"));

    if (session.get("me")) {
      return session.get("me");
    }

    return new Response(`Unauthorized`, {
      status: 401,
    });
  } catch (error) {
    return `Failed to get me - ${error}`;
  }
}
