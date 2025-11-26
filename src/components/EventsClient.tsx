"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import EventFilters from "./EventFilters";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  startDate: Date;
  endDate: Date | null;
  capacity: number | null;
  imageUrl: string | null;
  status: string;
  associationId: string;
  association: {
    name: string;
    user: {
      email: string;
    };
  };
  registrations: any[];
  _count: {
    registrations: number;
  };
}

interface EventsClientProps {
  events: Event[];
  registerForEvent: (formData: FormData) => Promise<void>;
  unregisterFromEvent: (formData: FormData) => Promise<void>;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function EventsClient({
  events,
  registerForEvent,
  unregisterFromEvent,
}: EventsClientProps) {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [filters, setFilters] = useState<{
    distance: number;
    categories: string[];
  }>({ distance: 50, categories: [] });

  useEffect(() => {
    // Get user's current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(
        (event) =>
          event.category && filters.categories.includes(event.category)
      );
    }

    // Filter by distance
    if (userLocation && filters.distance < 200) {
      filtered = filtered.filter((event) => {
        if (!event.latitude || !event.longitude) return false;
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          event.latitude,
          event.longitude
        );
        return distance <= filters.distance;
      });

      // Sort by distance (closest first)
      filtered.sort((a, b) => {
        if (!a.latitude || !a.longitude || !b.latitude || !b.longitude)
          return 0;
        const distA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude
        );
        const distB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude
        );
        return distA - distB;
      });
    }

    return filtered;
  }, [events, filters, userLocation]);

  const getEventDistance = (event: Event): string | null => {
    if (!userLocation || !event.latitude || !event.longitude) return null;
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      event.latitude,
      event.longitude
    );
    return distance < 1
      ? `${Math.round(distance * 1000)}m away`
      : `${distance.toFixed(1)}km away`;
  };

  return (
    <div>
      <EventFilters onFilterChange={setFilters} />

      {filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No events match your filters. Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isRegistered = event.registrations.length > 0;
            const isFull = Boolean(
              event.capacity && event._count.registrations >= event.capacity
            );
            const distance = getEventDistance(event);

            return (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link
                        href={`/associations/${event.associationId}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {event.association.name}
                      </Link>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {event.category && (
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full mb-3">
                      {event.category}
                    </span>
                  )}

                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      <span>
                        {new Date(event.startDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">⏰</span>
                      <span>
                        {new Date(event.startDate).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        <span className="flex-1">{event.location}</span>
                      </div>
                    )}
                    {distance && (
                      <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                        <span className="mr-2">🚶</span>
                        <span>{distance}</span>
                      </div>
                    )}
                    {event.capacity && (
                      <div className="flex items-center">
                        <span className="mr-2">👥</span>
                        <span>
                          {event._count.registrations} / {event.capacity}{" "}
                          registered
                        </span>
                      </div>
                    )}
                  </div>

                  <form
                    action={
                      isRegistered ? unregisterFromEvent : registerForEvent
                    }
                  >
                    <input type="hidden" name="eventId" value={event.id} />
                    <button
                      type="submit"
                      disabled={isFull && !isRegistered}
                      className={`
                        w-full py-3 px-4 rounded-xl font-bold transition-all
                        ${
                          isRegistered
                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                            : isFull
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        }
                      `}
                    >
                      {isRegistered
                        ? "✓ Registered - Click to Cancel"
                        : isFull
                        ? "Event Full"
                        : "Register for Event"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
