"use client";

import { useState, useEffect } from "react";

interface EventFiltersProps {
  onFilterChange: (filters: { distance: number; categories: string[] }) => void;
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

export default function EventFilters({ onFilterChange }: EventFiltersProps) {
  const [distance, setDistance] = useState(50); // Default 50km
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    // Check if geolocation is available
    if ("geolocation" in navigator) {
      setLocationEnabled(true);
    }
  }, []);

  useEffect(() => {
    onFilterChange({ distance, categories: selectedCategories });
  }, [distance, selectedCategories, onFilterChange]);

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          🔍 Filter Events
        </h2>
        {(selectedCategories.length > 0 || distance !== 50) && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
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
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          disabled={!locationEnabled}
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>1 km</span>
          <span>50 km</span>
          <span>100 km</span>
          <span>All</span>
        </div>
        {!locationEnabled && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            ⚠️ Enable location services to use distance filtering
          </p>
        )}
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
                    ? "bg-blue-600 text-white shadow-md transform scale-105"
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
  );
}
