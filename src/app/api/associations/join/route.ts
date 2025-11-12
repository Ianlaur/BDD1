import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to join an association" },
        { status: 401 }
      );
    }

    const { associationId } = await req.json();

    if (!associationId) {
      return NextResponse.json(
        { error: "Association ID is required" },
        { status: 400 }
      );
    }

    // Check if association exists
    const association = await prisma.associationProfile.findUnique({
      where: { id: associationId },
    });

    if (!association) {
      return NextResponse.json(
        { error: "Association not found" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        associationId,
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this association" },
        { status: 400 }
      );
    }

    // Create membership with PENDING status
    const membership = await prisma.membership.create({
      data: {
        userId: session.user.id,
        associationId,
        role: "MEMBER",
        status: "PENDING",
      },
      include: {
        association: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create a notification for the association admin
    await prisma.notification.create({
      data: {
        userId: association.userId,
        type: "MEMBERSHIP_REQUEST",
        title: "New Membership Request",
        content: `${session.user.name || session.user.email} has requested to join your association`,
      },
    });

    return NextResponse.json({
      message: "Membership request sent successfully",
      membership,
    });
  } catch (error) {
    console.error("Error joining association:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
