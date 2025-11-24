'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  startDate: string;
  imageUrl: string | null;
  association: {
    name: string;
  };
  distance?: number;
}

interface LocationState {
  granted: boolean;
  denied: boolean;
  loading: boolean;
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

export function NearbyEvents() {
  const [location, setLocation] = useState<LocationState>({
    granted: false,
    denied: false,
    loading: true,
    latitude: null,
    longitude: null,
    error: null,
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocation({
        granted: false,
        denied: true,
        loading: false,
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported by your browser',
      });
      return;
    }

    // Request user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          granted: true,
          denied: false,
          loading: false,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access denied. Please enable location permissions.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.';
        }
        
        setLocation({
          granted: false,
          denied: true,
          loading: false,
          latitude: null,
          longitude: null,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    // Fetch nearby events when location is obtained
    if (location.granted && location.latitude && location.longitude) {
      fetchNearbyEvents(location.latitude, location.longitude);
    }
  }, [location.granted, location.latitude, location.longitude]);

  const fetchNearbyEvents = async (lat: number, lon: number) => {
    setLoadingEvents(true);
    try {
      const response = await fetch(
        `/api/events/nearby?latitude=${lat}&longitude=${lon}&radius=50`
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching nearby events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const requestLocationAgain = () => {
    setLocation({ ...location, loading: true, denied: false });
    window.location.reload();
  };

  // Loading state
  if (location.loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f67a19] mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Getting your location...</p>
      </div>
    );
  }

  // Denied state
  if (location.denied) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Location Access Required</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          {location.error || 'We need your location to show events happening around you.'}
        </p>
        <button
          onClick={requestLocationAgain}
          className="px-6 py-3 bg-[#f67a19] text-white rounded-xl font-semibold hover:bg-[#e56910] transition-all"
        >
          Enable Location
        </button>
      </div>
    );
  }

  // Loading events
  if (loadingEvents) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f67a19] mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Finding events near you...</p>
      </div>
    );
  }

  // No events found
  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📍</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No Events Nearby</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          We couldn't find any events happening near your location right now.
        </p>
        <Link
          href="/events"
          className="inline-block px-6 py-3 bg-[#f67a19] text-white rounded-xl font-semibold hover:bg-[#e56910] transition-all"
        >
          Browse All Events
        </Link>
      </div>
    );
  }

  // Display events
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#112a60] dark:text-white mb-2">Events Near You</h2>
          <p className="text-gray-600 dark:text-gray-300">
            📍 Showing events within 50km of your location
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="group bg-white dark:bg-[#112a60]/50 rounded-3xl overflow-hidden card-hover border border-gray-100 dark:border-[#a5dce2]/20"
          >
            {/* Event Image */}
            <div className="relative h-48 bg-linear-to-br from-[#f67a19]/20 to-[#a5dce2]/20 overflow-hidden">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">🎉</span>
                </div>
              )}
              {event.distance && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-[#112a60]">
                  {event.distance.toFixed(1)} km away
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#112a60] dark:text-white mb-2 group-hover:text-[#f67a19] transition-colors">
                {event.title}
              </h3>
              
              <p className="text-sm text-[#f67a19] font-semibold mb-3">
                {event.association.name}
              </p>

              {event.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(event.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>

              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
