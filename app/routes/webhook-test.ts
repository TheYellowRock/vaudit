import { json } from "app/utils/response.server";
import { verifyHmac } from "app/utils/verify-hmac.server";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256"); // <-- must be lowercase

  if (!verifyHmac(rawBody, hmac)) {
    console.error("❌ Invalid HMAC");
    return new Response("Invalid HMAC", { status: 401 });
  }

  console.log("✅ Valid HMAC");
  console.log(rawBody);

  return json({ ok: true });
}

export const loader = () =>
  new Response("Webhook test endpoint", { status: 200 });
