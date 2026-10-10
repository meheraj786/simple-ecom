import "dotenv/config";
import { prisma } from "../src/db.js";

async function seedVendor(): Promise<void> {
  const email = process.env.SEED_VENDOR_EMAIL?.trim().toLowerCase();
  const name = process.env.SEED_VENDOR_NAME?.trim() || "Store Vendor";

  if (!email) {
    throw new Error(
      "SEED_VENDOR_EMAIL must be set before running the vendor seed",
    );
  }

  await prisma.$connect();

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: "ADMIN", isRegistered: true },
    create: {
      email,
      name,
      role: "ADMIN",
      provider: "google",
      isRegistered: true,
    },
  });

  await prisma.account.upsert({
    where: { vendorId: user.id },
    update: {},
    create: { vendorId: user.id },
  });

  console.log("Vendor admin account ready");
}

seedVendor()
  .catch((error: unknown) => {
    console.error("Vendor seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
