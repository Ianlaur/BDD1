import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  console.log("🔍 Testing database connection...\n");

  try {
    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connected successfully!\n");

    // Test query execution
    console.log("📊 Running test queries...\n");

    // Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);

    // Count associations
    const associationCount = await prisma.associationProfile.count();
    console.log(`🏢 Associations: ${associationCount}`);

    // Count events
    const eventCount = await prisma.event.count();
    console.log(`📅 Events: ${eventCount}`);

    // Count memberships
    const membershipCount = await prisma.membership.count();
    console.log(`🤝 Memberships: ${membershipCount}\n`);

    // List all users
    console.log("📋 Users in database:");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (users.length === 0) {
      console.log("   ⚠️  No users found in database\n");
    } else {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name || "Unnamed"}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Verified: ${user.emailVerified ? "Yes" : "No"}`);
        console.log("");
      });
    }

    // Test database version
    const result = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version();
    `;
    console.log("🗄️  Database Info:");
    console.log(`   ${result[0].version}\n`);

    console.log("✅ All database tests passed!");
    console.log("🎉 Your database is working correctly!\n");

    return true;
  } catch (error) {
    console.error("❌ Database connection failed!\n");
    console.error("Error details:", error);
    console.error("\n💡 Troubleshooting tips:");
    console.error("   1. Check your DATABASE_URL in .env file");
    console.error("   2. Make sure it includes ?sslmode=require");
    console.error("   3. Verify your Neon database is active");
    console.error("   4. Check if your IP is allowed (Neon should allow all by default)");
    console.error("   5. Make sure you've run: npx prisma generate\n");
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
