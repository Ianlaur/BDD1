import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const associationId = 'cmi5vx2bx0002lcxm33357rzs';
  
  console.log('🔍 Finding association owner...\n');
  
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
  console.log(`Owner Email: ${association.user.email}`);
  
  // Check if owner has a membership
  const ownerMembership = association.memberships.find(
    (m) => m.user.email === association.user.email
  );

  if (ownerMembership) {
    console.log(`\n✅ Owner already has membership: ${ownerMembership.role}`);
    
    // Update to board if not already
    if (ownerMembership.role !== 'board') {
      await prisma.membership.update({
        where: { id: ownerMembership.id },
        data: { role: 'board', status: 'ACTIVE' },
      });
      console.log('🔄 Updated owner to board member!');
    }
  } else {
    console.log('\n❌ Owner does not have a membership. Creating one...');
    
    await prisma.membership.create({
      data: {
        userId: association.userId,
        associationId: associationId,
        role: 'board',
        status: 'ACTIVE',
      },
    });
    
    console.log('✅ Created board membership for owner!');
  }

  // Show final state
  const final = await prisma.associationProfile.findUnique({
    where: { id: associationId },
    include: {
      memberships: {
        include: {
          user: true,
        },
      },
    },
  });

  console.log('\n📊 Final memberships:\n');
  final?.memberships.forEach((m) => {
    console.log(`  - ${m.user.name || m.user.email}: ${m.status} / ${m.role}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
