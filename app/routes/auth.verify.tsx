import type { TurnstileServerValidationResponse } from "@marsidev/react-turnstile";
import { ActionFunctionArgs, json } from "@remix-run/node";

const verifyEndpoint =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function action({ request }: ActionFunctionArgs) {
  switch (request.method) {
    case "POST": {
      const { token } = (await request.json()) as { token: string };
      const secret = process.env.TURNSTILE_SECRET!;

      const res = await fetch(verifyEndpoint, {
        method: "POST",
        body: `secret=${encodeURIComponent(
          secret
        )}&response=${encodeURIComponent(token)}`,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      });

      const data = (await res.json()) as TurnstileServerValidationResponse;

      return json(data, {
        status: data.success ? 200 : 400,
      });
    }
  }
}
