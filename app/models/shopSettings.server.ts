import  prisma  from "app/db.server";

export async function getShopPassKey(shop: string) {
  return prisma.shopSettings.findUnique({ where: { shop } });
}

export async function upsertShopPassKey(shop: string, passKey: string) {
  return prisma.shopSettings.upsert({
    where: { shop },
    update: { passKey },
    create: { shop, passKey },
  });
}

export async function deleteShopSettings(shop: string) {
  return prisma.shopSettings.deleteMany({ where: { shop } });
}
