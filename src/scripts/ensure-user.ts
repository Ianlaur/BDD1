import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "ilaurent@eugeniaschool.com";
  const password = "admin123";
  const name = "Ian Laurent";

  console.log("🔍 Checking for user:", email);

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      associationProfile: true,
    },
  });

  if (existingUser) {
    console.log("✅ User found!");
    console.log("   ID:", existingUser.id);
    console.log("   Email:", existingUser.email);
    console.log("   Name:", existingUser.name);
    console.log("   Role:", existingUser.role);
    console.log("   Has password:", !!existingUser.password);
    console.log("   Has association profile:", !!existingUser.associationProfile);

    // Update password if needed
    const hashedPassword = await hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });
    console.log("🔑 Password updated successfully!");
  } else {
    console.log("❌ User not found. Creating new user...");

    const hashedPassword = await hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "ASSOCIATION",
        emailVerified: new Date(),
      },
    });

    console.log("✅ User created successfully!");
    console.log("   ID:", newUser.id);
    console.log("   Email:", newUser.email);
    console.log("   Name:", newUser.name);
    console.log("   Role:", newUser.role);
  }

  console.log("\n✨ You can now sign in with:");
  console.log("   Email:", email);
  console.log("   Password:", password);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
