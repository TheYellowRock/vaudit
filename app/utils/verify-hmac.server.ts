import crypto from "crypto";

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET!;

/**
 * Validates a Shopify webhook HMAC signature.
 *
 * @param body Raw request body string
 * @param hmacHeader Value from `X-Shopify-Hmac-Sha256`
 */
export function verifyHmac(body: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) return false;

  const digest = crypto
    .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(hmacHeader)
  );
}
