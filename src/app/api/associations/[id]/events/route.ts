import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const association = await prisma.associationProfile.findUnique({
      where: { id },
    });

    if (!association || session.user.id !== association.userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const latitude = formData.get("latitude") as string;
    const longitude = formData.get("longitude") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const capacity = formData.get("capacity") as string;
    const status = formData.get("status") as string;

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        location: location || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        capacity: capacity ? parseInt(capacity) : null,
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        associationId: id,
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
