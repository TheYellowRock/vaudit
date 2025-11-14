import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Verify this webhook actually comes from Shopify (required)
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log("📩 GDPR Webhook received:", { topic, shop });

  switch (topic) {
    // ------------------------------
    // 🛒 SHOP REDACT — delete all shop data
    // ------------------------------
    case "shop/redact":
      await prisma.session.deleteMany({ where: { shop } });
      await prisma.shopSettings.deleteMany({ where: { shop } });

      console.log(`🗑️ Deleted all data for shop: ${shop}`);
      break;

    // ------------------------------
    // 👤 CUSTOMER REDACT — no-op
    // ------------------------------
    case "customers/redact":
      console.log("ℹ️ No customer data stored. Nothing to delete.");
      break;

    // ------------------------------
    // 👤 CUSTOMER DATA REQUEST — no-op
    // ------------------------------
    case "customers/data_request":
      console.log("ℹ️ No customer data stored. Returning empty.");
      break;

    default:
      console.warn(`⚠️ Unhandled privacy webhook topic: ${topic}`);
  }

  return new Response("OK", { status: 200 });
};
