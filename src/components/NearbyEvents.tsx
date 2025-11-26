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
  category: string | null;
  startDate: string;
  imageUrl: string | null;
  association: {
    id: string;
    user: {
      name: string | null;
    };
  };
  distance?: number;
}

const CATEGORIES = [
  "Technology & Innovation",
  "Academic & Professional",
  "Arts & Culture",
  "Athletics & Recreation",
  "Community Service & Volunteering",
  "Cultural & International",
  "Media & Publications",
  "Political & Advocacy",
  "Religious & Spiritual",
  "Special Interest & Hobbies",
  "Business & Entrepreneurship",
  "Health & Wellness",
  "Social & Networking",
  "Other",
];

const CATEGORY_ICONS: { [key: string]: string } = {
  "Technology & Innovation": "🖥️",
  "Academic & Professional": "📚",
  "Arts & Culture": "🎨",
  "Athletics & Recreation": "⚽",
  "Community Service & Volunteering": "🤝",
  "Cultural & International": "🌍",
  "Media & Publications": "📰",
  "Political & Advocacy": "🗳️",
  "Religious & Spiritual": "🙏",
  "Special Interest & Hobbies": "🎯",
  "Business & Entrepreneurship": "💼",
  "Health & Wellness": "💪",
  "Social & Networking": "🎉",
  "Other": "📌",
};

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
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [distance, setDistance] = useState(50);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
      fetchNearbyEvents(location.latitude, location.longitude, distance);
    }
  }, [location.granted, location.latitude, location.longitude, distance]);

  useEffect(() => {
    // Apply filters to events
    let filtered = [...events];
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(
        (event) => event.category && selectedCategories.includes(event.category)
      );
    }
    
    setFilteredEvents(filtered);
  }, [events, selectedCategories]);

  const fetchNearbyEvents = async (lat: number, lon: number, radius: number) => {
    setLoadingEvents(true);
    try {
      const response = await fetch(
        `/api/events/nearby?latitude=${lat}&longitude=${lon}&radius=${radius}`
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

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setDistance(50);
    setSelectedCategories([]);
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

  const displayEvents = filteredEvents.length > 0 || selectedCategories.length > 0 ? filteredEvents : events;

  // Display events
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-[#112a60] dark:text-white mb-2">Events Near You</h2>
        <p className="text-gray-600 dark:text-gray-300">
          📍 Discover events happening around you
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            🔍 Filter Events
          </h3>
          {(selectedCategories.length > 0 || distance !== 50) && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-[#f67a19] hover:text-[#e56910] font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Distance Filter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              📍 Distance Range
            </label>
            <span className="text-sm font-semibold text-[#f67a19]">
              {distance === 200 ? "All Distances" : `Within ${distance} km`}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="200"
            step="5"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#f67a19]"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 km</span>
            <span>50 km</span>
            <span>100 km</span>
            <span>All</span>
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 block">
            🏷️ Event Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${
                    selectedCategories.includes(category)
                      ? "bg-[#f67a19] text-white shadow-md transform scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }
                `}
              >
                {CATEGORY_ICONS[category]} {category}
              </button>
            ))}
          </div>
          {selectedCategories.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              {selectedCategories.length} {selectedCategories.length === 1 ? "category" : "categories"} selected
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      {displayEvents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 dark:text-gray-300">
            No events match your filters. Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {displayEvents.length} {displayEvents.length === 1 ? 'event' : 'events'}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((event) => (
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
                {event.association.user.name || 'Unknown Association'}
              </p>

              {event.category && (
                <span className="inline-block px-3 py-1 bg-[#a5dce2]/20 text-[#112a60] dark:text-[#a5dce2] text-xs font-semibold rounded-full mb-3">
                  {CATEGORY_ICONS[event.category] || '📌'} {event.category}
                </span>
              )}

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
        </>
      )}
    </div>
  );
}
