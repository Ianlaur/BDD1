import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const associationId = 'cmi5vx2bx0002lcxm33357rzs';
  
  console.log('🔍 Checking association...\n');
  
  const association = await prisma.associationProfile.findUnique({
    where: { id: associationId },
    include: {
      user: true,
      memberships: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!association) {
    console.log('❌ Association not found!');
    return;
  }

  console.log(`Association: ${association.user.name}`);
  console.log(`ID: ${association.id}`);
  console.log(`\nMemberships (${association.memberships.length}):`);
  
  association.memberships.forEach((m) => {
    console.log(`  - ${m.user.name || m.user.email}: ${m.status} / ${m.role}`);
  });

  // Approve any pending memberships
  console.log('\n🔄 Approving pending memberships...\n');
  
  const approved = await prisma.membership.updateMany({
    where: {
      associationId: associationId,
      status: 'PENDING',
    },
    data: {
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Approved ${approved.count} pending memberships`);

  // Show updated memberships
  const updated = await prisma.associationProfile.findUnique({
    where: { id: associationId },
    include: {
      memberships: {
        include: {
          user: true,
        },
      },
    },
  });

  console.log('\n📊 Updated memberships:\n');
  updated?.memberships.forEach((m) => {
    console.log(`  - ${m.user.name || m.user.email}: ${m.status} / ${m.role}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
