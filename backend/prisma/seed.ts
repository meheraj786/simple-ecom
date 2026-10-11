import "dotenv/config";
import { connectDB, disconnectDB, prisma } from "../src/db.js";
import { hashPassword } from "../src/utils/password.js";

async function seedVendor(): Promise<void> {
  const email = process.env.SEED_VENDOR_EMAIL?.trim().toLowerCase();
  const name = process.env.SEED_VENDOR_NAME?.trim() || "Store Vendor";
  const password = process.env.SEED_VENDOR_PASSWORD?.trim();

  if (!email) {
    throw new Error(
      "SEED_VENDOR_EMAIL must be set before running the vendor seed",
    );
  }
  if (!password || password.length < 12) {
    throw new Error(
      "SEED_VENDOR_PASSWORD must be set to at least 12 characters",
    );
  }

  const passwordHash = await hashPassword(password);

  await connectDB();

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: "ADMIN", isRegistered: true, password: passwordHash },
    create: {
      email,
      name,
      password: passwordHash,
      role: "ADMIN",
      provider: "local",
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
    await disconnectDB();
  });
