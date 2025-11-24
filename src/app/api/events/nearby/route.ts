import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latitude = parseFloat(searchParams.get("latitude") || "");
    const longitude = parseFloat(searchParams.get("longitude") || "");
    const radius = parseFloat(searchParams.get("radius") || "50"); // Default 50km

    // Validate inputs
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude" },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Latitude must be between -90 and 90, longitude between -180 and 180" },
        { status: 400 }
      );
    }

    // Fetch all published events with location data
    const events = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        latitude: { not: null },
        longitude: { not: null },
        startDate: {
          gte: new Date(), // Only future events
        },
      },
      include: {
        association: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    // Filter events by distance and add distance property
    const nearbyEvents = events
      .map((event) => {
        if (event.latitude === null || event.longitude === null) return null;
        
        const distance = calculateDistance(
          latitude,
          longitude,
          event.latitude,
          event.longitude
        );

        return {
          ...event,
          distance,
        };
      })
      .filter((event): event is NonNullable<typeof event> => 
        event !== null && event.distance <= radius
      )
      .sort((a, b) => a.distance - b.distance) // Sort by closest first
      .slice(0, 12); // Limit to 12 events

    return NextResponse.json({
      events: nearbyEvents,
      userLocation: { latitude, longitude },
      radius,
      count: nearbyEvents.length,
    });
  } catch (error) {
    console.error("Error fetching nearby events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
