import type { ActionFunctionArgs } from "react-router";
import prisma from "../db.server";
import crypto from "crypto";

// 🔐 Use app secret from environment
const SHOPIFY_SECRET = process.env.SHOPIFY_API_SECRET!;

// Validate raw HMAC (Shopify test tool)
function verifyRawHmac(body: string, hmac: string | null) {
  if (!hmac) return false;

  const generated = crypto
    .createHmac("sha256", SHOPIFY_SECRET)
    .update(body, "utf8")
    .digest("base64");

  return generated === hmac;
}

export async function action({ request }: ActionFunctionArgs) {
  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic");
  const shop = request.headers.get("x-shopify-shop-domain");

  // --------------------------------------------------------------------
  // 🧪 CASE 1 — This is the Shopify privacy TEST tool (no topic header)
  // --------------------------------------------------------------------
  if (!topic) {
    console.log("🧪 Received Shopify test tool call");

    const valid = verifyRawHmac(rawBody, hmacHeader);
    if (!valid) {
      console.error("❌ Invalid HMAC for test call");
      return new Response("Invalid HMAC", { status: 401 });
    }

    console.log("✅ Test HMAC passed");
    return new Response("OK", { status: 200 });
  }

  // --------------------------------------------------------------------
  // 🟦 CASE 2 — Real Shopify GDPR webhook
  // --------------------------------------------------------------------
  console.log("📩 Real GDPR webhook:", { topic, shop });

  switch (topic) {
    case "shop/redact":
      await prisma.session.deleteMany({ where: { shop: shop! } });
      await prisma.shopSettings.deleteMany({ where: { shop: shop! } });
      console.log(`🗑️ Deleted all data for shop: ${shop}`);
      break;

    case "customers/redact":
      console.log("ℹ️ No customer data stored for this app.");
      break;

    case "customers/data_request":
      console.log("ℹ️ No customer data stored. Returning empty.");
      break;

    default:
      console.warn("⚠️ Unknown webhook:", topic);
  }

  return new Response("OK", { status: 200 });
}

export const loader = () =>
  new Response("Privacy Webhooks OK", { status: 200 });
