import { createMetafield, fetchMetafield, Metafield, updateMetafield } from "./metafields-crud";

export async function upsertMetafield(
  shop: string,
  accessToken: string,
  namespace: string,
  key: string,
  value: string,
  type: string
) {
  try {
    console.log("🔍 Checking existing metafield...");
    const existingMetafield = await fetchMetafield(shop, accessToken, namespace, key);

    if (existingMetafield) {
      existingMetafield.value = value;
      const updated = await updateMetafield(shop, accessToken, existingMetafield);
      console.log("✅ Metafield updated:", updated);
    } else {
      const newMetafield: Metafield = { namespace, key, value, type };
      const created = await createMetafield(shop, accessToken, newMetafield);
      console.log("✅ Metafield created:", created);
    }
  } catch (error) {
    console.error("❌ Error upserting metafield:", error);
  }
}
