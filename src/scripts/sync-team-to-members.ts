import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const associationId = 'cmi5vx2bx0002lcxm33357rzs';
  
  console.log('🔍 Checking team members...\n');
  
  const association = await prisma.associationProfile.findUnique({
    where: { id: associationId },
    include: {
      user: true,
      teamMembers: true,
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

  console.log(`Association: ${association.user.name}\n`);
  
  console.log(`📋 Team Members (${association.teamMembers.length}):`);
  association.teamMembers.forEach((tm) => {
    console.log(`  - ${tm.name} (${tm.position}) - Role: ${tm.role}`);
    console.log(`    Email: ${tm.email || 'N/A'}`);
  });

  console.log(`\n👥 Current Memberships (${association.memberships.length}):`);
  association.memberships.forEach((m) => {
    console.log(`  - ${m.user.name || m.user.email}: ${m.status} / ${m.role}`);
  });

  // Count board members
  const boardMembers = association.teamMembers.filter(tm => tm.role === 'board');
  const regularMembers = association.teamMembers.filter(tm => tm.role !== 'board');
  
  console.log(`\n📊 Summary:`);
  console.log(`  Board Members in Team: ${boardMembers.length}`);
  console.log(`  Regular Members in Team: ${regularMembers.length}`);
  console.log(`  Actual Memberships: ${association.memberships.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
