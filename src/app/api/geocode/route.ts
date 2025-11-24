import { NextRequest, NextResponse } from "next/server";

/**
 * Geocode an address to latitude/longitude using OpenStreetMap Nominatim API
 * This is a free service with no API key required
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    // Use OpenStreetMap Nominatim API (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: address,
          format: "json",
          limit: "1",
        }),
      {
        headers: {
          "User-Agent": "AssociationConnect/1.0", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding service unavailable");
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    const result = data[0];

    return NextResponse.json({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village,
      country: result.address?.country,
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}
