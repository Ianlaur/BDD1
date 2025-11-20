import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Checking memberships...\n');
  
  const memberships = await prisma.membership.findMany({
    include: {
      user: true,
      association: {
        include: {
          user: true,
        },
      },
    },
  });

  console.log(`Found ${memberships.length} memberships:\n`);
  
  memberships.forEach((m) => {
    console.log(`Association: ${m.association.user.name}`);
    console.log(`Member: ${m.user.name || m.user.email}`);
    console.log(`Status: ${m.status}`);
    console.log(`Role: ${m.role || '(null)'}`);
    console.log('---');
  });

  // Update any old roles
  console.log('\n🔄 Updating roles...\n');
  
  const updated = await prisma.membership.updateMany({
    where: {
      role: {
        in: ['ADMIN', 'admin', 'MODERATOR', 'moderator', 'PRESIDENT', 'president'],
      },
    },
    data: {
      role: 'board',
    },
  });

  console.log(`✅ Updated ${updated.count} memberships to 'board' role`);

  const updatedMembers = await prisma.membership.updateMany({
    where: {
      OR: [
        { role: null },
        { role: { notIn: ['board', 'member'] } },
      ],
    },
    data: {
      role: 'member',
    },
  });

  console.log(`✅ Updated ${updatedMembers.count} memberships to 'member' role`);

  // Show updated memberships
  console.log('\n📊 Updated memberships:\n');
  
  const allMemberships = await prisma.membership.findMany({
    include: {
      user: true,
      association: {
        include: {
          user: true,
        },
      },
    },
  });

  allMemberships.forEach((m) => {
    console.log(`${m.association.user.name} - ${m.user.name || m.user.email}: ${m.status} / ${m.role}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
