// app/routes/webhooks.privacy.ts
import type { ActionFunctionArgs } from "react-router";
import prisma from "../db.server";
import crypto from "crypto";

function verifyHmac(body: string, hmac: string | null) {
  if (!hmac) return false;

  const secret = process.env.SHOPIFY_API_SECRET!;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac));
}

export const action = async ({ request }: ActionFunctionArgs) => {
  // 1️⃣ Read raw body
  const body = await request.text();

  // 2️⃣ Extract HMAC header
  const hmac = request.headers.get("X-Shopify-Hmac-Sha256");

  // 3️⃣ Reject invalid HMAC (required for test)
  if (!verifyHmac(body, hmac)) {
    console.error("❌ Invalid HMAC");
    return new Response("Unauthorized", { status: 401 });
  }

  // 4️⃣ Parse JSON AFTER validating HMAC
  const data = JSON.parse(body);
  const topic = request.headers.get("X-Shopify-Topic") || "";
  const shop = request.headers.get("X-Shopify-Shop-Domain") || "";

  console.log("📩 GDPR Webhook:", topic, shop, data);

  // 5️⃣ Handle topics
  switch (topic) {
    case "shop/redact":
      await prisma.session.deleteMany({ where: { shop } });
      await prisma.shopSettings.deleteMany({ where: { shop } });

      console.log(`🗑️ Deleted shop data: ${shop}`);
      break;

    case "customers/redact":
      console.log("ℹ️ No customer data stored — nothing to delete.");
      break;

    case "customers/data_request":
      console.log("ℹ️ No customer data stored — nothing to return.");
      break;

    default:
      console.log("⚠️ Unknown privacy topic:", topic);
  }

  return new Response("OK", { status: 200 });
};

export const loader = () =>
  new Response("Privacy webhook endpoint", { status: 200 });
