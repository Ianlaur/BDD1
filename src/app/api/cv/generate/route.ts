import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      memberships: {
        include: {
          association: {
            include: {
              user: true,
            },
          },
        },
        where: { status: "ACTIVE" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // For now, redirect to preview with a print dialog
  // In production, you would use a library like puppeteer or a PDF generation service
  return NextResponse.redirect(
    new URL(`/api/cv/preview?userId=${userId}`, request.url)
  );
}
