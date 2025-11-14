import { json } from "app/utils/response.server";
import crypto from "crypto";
import { ActionFunctionArgs } from "react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
  const secret = process.env.SHOPIFY_API_SECRET!;

  const body = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256") || "";

  const hash = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  if (hash !== hmac) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Respond OK so Shopify checker passes you
  return json({ ok: true });
};
