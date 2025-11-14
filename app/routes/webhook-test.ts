// app/routes/webhook-test.ts
import { json } from "app/utils/response.server";
import { verifyHmac } from "app/utils/verify-hmac.server";
import { ActionFunctionArgs } from "react-router";


export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  const hmac = request.headers.get("X-Shopify-Hmac-Sha256");

  if (!verifyHmac(body, hmac)) {
    console.error("❌ Invalid HMAC");
    return new Response("Invalid HMAC", { status: 401 });
  }

  console.log("✅ Valid HMAC:", body);
  return json({ ok: true });
}

export const loader = () =>
  new Response("Webhook test endpoint", { status: 200 });
