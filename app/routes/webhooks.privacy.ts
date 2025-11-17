import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import crypto from "crypto";

function verifyRawHmac(body: string, hmac: string | null, secret: string) {
  if (!hmac) return false;

  const generated = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  return generated === hmac;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const secret = process.env.SHOPIFY_API_SECRET!;

  // ---------------------------------------------
  // 🧪 1. RAW HMAC TEST SUPPORT (Shopify Test Tool)
  // ---------------------------------------------
  if (request.headers.get("x-shopify-topic") === null) {
    // Test requests do not include webhook headers
    console.log("🧪 Raw HMAC validation request received");

    const valid = verifyRawHmac(rawBody, hmacHeader, secret);
    if (!valid) {
      console.error("❌ Invalid test HMAC");
      return new Response("Invalid HMAC", { status: 401 });
    }

    console.log("✅ Raw HMAC validated successfully");
    return new Response("HMAC OK", { status: 200 });
  }

  // --------------------------------------------------------
  // 2. REAL SHOPIFY WEBHOOK — use Shopify’s built-in verifier
  // --------------------------------------------------------
  const { topic, shop, payload } = await authenticate.webhook(request);
  console.log("📩 GDPR Webhook received:", { topic, shop });

  switch (topic) {
    case "shop/redact":
      await prisma.session.deleteMany({ where: { shop } });
      await prisma.shopSettings.deleteMany({ where: { shop } });
      console.log(`🗑️ Deleted all data for shop: ${shop}`);
      break;

    case "customers/redact":
      console.log("ℹ️ No customer data stored. Nothing to delete.");
      break;

    case "customers/data_request":
      console.log("ℹ️ No customer data stored. Returning empty.");
      break;

    default:
      console.warn(`⚠️ Unhandled privacy webhook topic: ${topic}`);
  }

  return new Response("OK", { status: 200 });
};
