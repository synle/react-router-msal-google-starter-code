import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { destroySession, getSession } from "~/utils/backend/Session";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    return redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  } catch (err) {
    return new Response(`Failed to log in - ${(err as Error).message}`, {
      status: 400,
    });
  }
}
