import { prisma } from "./prisma";

/**
 * Syncs approved memberships to team members
 * When a membership is approved, create a corresponding team member
 */
export async function syncMembershipToTeam(
  membershipId: string,
  associationId: string
) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: {
      user: true,
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return;
  }

  // Check if team member already exists
  const existingTeamMember = await prisma.teamMember.findFirst({
    where: {
      associationId,
      email: membership.user.email,
    },
  });

  if (existingTeamMember) {
    // Update existing team member
    await prisma.teamMember.update({
      where: { id: existingTeamMember.id },
      data: {
        active: true,
        role: membership.role || "member",
      },
    });
  } else {
    // Create new team member
    await prisma.teamMember.create({
      data: {
        associationId,
        name: membership.user.name || membership.user.email,
        email: membership.user.email,
        position: membership.role || "Member",
        role: membership.role || "member",
        active: true,
        notes: `Auto-synced from membership on ${new Date().toLocaleDateString()}`,
      },
    });
  }
}

/**
 * Syncs all active memberships to team members
 */
export async function syncAllMembershipsToTeam(associationId: string) {
  const activeMemberships = await prisma.membership.findMany({
    where: {
      associationId,
      status: "ACTIVE",
    },
    include: {
      user: true,
    },
  });

  for (const membership of activeMemberships) {
    const existingTeamMember = await prisma.teamMember.findFirst({
      where: {
        associationId,
        email: membership.user.email,
      },
    });

    if (!existingTeamMember) {
      await prisma.teamMember.create({
        data: {
          associationId,
          name: membership.user.name || membership.user.email,
          email: membership.user.email,
          position: membership.role || "Member",
          role: membership.role || "member",
          active: true,
          notes: `Auto-synced from membership`,
        },
      });
    }
  }

  return activeMemberships.length;
}
