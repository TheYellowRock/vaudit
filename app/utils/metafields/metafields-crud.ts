import { config } from "dotenv";
config();

export interface Metafield {
  id?: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
}

const API_VERSION = "2026-01"; // 🔧 Match your toml
function normalizeShopUrl(shop: string): string {
  return shop.startsWith("https://") ? shop : `https://${shop}`;
}

// 🔹 Fetch metafield
export async function fetchMetafield(
  shop: string,
  accessToken: string,
  namespace: string,
  key: string
): Promise<Metafield | null> {
  const shopUrl = normalizeShopUrl(shop);
  const url = `${shopUrl}/admin/api/${API_VERSION}/metafields.json?namespace=${namespace}&key=${key}`;

  console.log("🛰️ Fetching metafield from:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken!,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch metafield: ${response.statusText}`);
  }

  const data = await response.json();
  return data.metafields?.length > 0 ? data.metafields[0] : null;
}

// 🔹 Create metafield
export async function createMetafield(
  shop: string,
  accessToken: string,
  metafield: Metafield
): Promise<Metafield> {
  const shopUrl = normalizeShopUrl(shop);
  const url = `${shopUrl}/admin/api/${API_VERSION}/metafields.json`;

  console.log("🛰️ Creating metafield at:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken!,
    },
    body: JSON.stringify({ metafield }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Shopify metafield creation failed:", errorBody);
    throw new Error(`Failed to create metafield: ${response.statusText}`);
  }

  const data = await response.json();
  return data.metafield;
}

// 🔹 Update metafield
export async function updateMetafield(
  shop: string,
  accessToken: string,
  metafield: Metafield
): Promise<Metafield> {
  if (!metafield.id) {
    throw new Error("Metafield ID is required for updates.");
  }

  const shopUrl = normalizeShopUrl(shop);
  const url = `${shopUrl}/admin/api/${API_VERSION}/metafields/${metafield.id}.json`;

  console.log("🛰️ Updating metafield at:", url);

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken!,
    },
    body: JSON.stringify({ metafield }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Shopify metafield update failed:", errorBody);
    throw new Error(`Failed to update metafield: ${response.statusText}`);
  }

  const data = await response.json();
  return data.metafield;
}
