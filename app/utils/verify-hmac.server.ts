import crypto from "crypto";

export function verifyHmac(body: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) return false;

  const secret = process.env.SHOPIFY_API_SECRET!;
  const computedHmac = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHmac, "utf-8"),
      Buffer.from(hmacHeader, "utf-8")
    );
  } catch {
    return false;
  }
}
