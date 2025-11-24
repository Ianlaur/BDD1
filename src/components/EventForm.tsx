'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EventFormProps {
  associationId: string;
  associationName: string;
}

export function EventForm({ associationId, associationName }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    displayName: string;
  } | null>(null);
  const [error, setError] = useState('');

  const handleLocationBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const address = e.target.value.trim();
    if (!address) {
      setLocationData(null);
      return;
    }

    setGeocoding(true);
    setError('');

    try {
      const response = await fetch(
        `/api/geocode?address=${encodeURIComponent(address)}`
      );

      if (response.ok) {
        const data = await response.json();
        setLocationData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Could not find location');
        setLocationData(null);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Failed to geocode address');
      setLocationData(null);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    // Add coordinates if we have them
    if (locationData) {
      formData.append('latitude', locationData.latitude.toString());
      formData.append('longitude', locationData.longitude.toString());
    }

    try {
      const response = await fetch(`/api/associations/${associationId}/events`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.push('/events');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create event');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError('An error occurred while creating the event');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Event Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Event Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
          placeholder="Annual Tech Conference 2025"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition resize-none"
          placeholder="Tell attendees about your event, what to expect, and any special requirements..."
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Location *
        </label>
        <input
          type="text"
          id="location"
          name="location"
          required
          onBlur={handleLocationBlur}
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
          placeholder="123 Main Street, City, Country"
        />
        {geocoding && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            🔍 Finding location on map...
          </p>
        )}
        {locationData && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400">
              ✓ Location found: {locationData.displayName}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              📍 Coordinates: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
            </p>
          </div>
        )}
        {error && !geocoding && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
            ⚠️ {error} - Event will be created without map coordinates
          </p>
        )}
      </div>

      {/* Date & Time */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Start Date & Time *
          </label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            required
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
          />
        </div>
      </div>

      {/* Capacity */}
      <div>
        <label htmlFor="capacity" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Maximum Capacity
        </label>
        <input
          type="number"
          id="capacity"
          name="capacity"
          min="1"
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
          placeholder="100"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Leave empty for unlimited capacity
        </p>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <select
          id="status"
          name="status"
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
        >
          <option value="DRAFT">Draft (not visible to students)</option>
          <option value="PUBLISHED">Published (visible to all)</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading || geocoding}
          className="flex-1 bg-[#f67a19] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e56910] transition disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
        >
          {loading ? '⏳ Creating Event...' : '📅 Create Event'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
