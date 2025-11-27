"use client";

import { useState } from "react";

interface Experience {
  id: string;
  company: string;
  position: string;
  description: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
}

interface ExperiencesManagerProps {
  initialExperiences: Experience[];
  profileId: string;
}

export default function ExperiencesManager({ initialExperiences, profileId }: ExperiencesManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [experiences, setExperiences] = useState(initialExperiences);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
          💼 Expériences professionnelles
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
        >
          {showForm ? "✕ Annuler" : "+ Ajouter une expérience"}
        </button>
      </div>

      {showForm && (
        <form action="/api/profile/experiences/add" method="POST" className="mb-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 space-y-4">
          <input type="hidden" name="profileId" value={profileId} />
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Entreprise *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                placeholder="Google France"
              />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Poste *
              </label>
              <input
                type="text"
                id="position"
                name="position"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                placeholder="Stage développeur full-stack"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Localisation
            </label>
            <input
              type="text"
              id="location"
              name="location"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
              placeholder="Paris, France"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition resize-none"
              placeholder="Missions principales et réalisations..."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Date de début *
              </label>
              <input
                type="month"
                id="startDate"
                name="startDate"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Date de fin
              </label>
              <input
                type="month"
                id="endDate"
                name="endDate"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="current"
                  className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Poste actuel
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
          >
            💾 Enregistrer l'expérience
          </button>
        </form>
      )}

      {experiences.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">💼</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aucune expérience ajoutée pour le moment
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ajoutez vos expériences professionnelles pour enrichir votre CV
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                    {exp.position}
                  </h3>
                  <p className="text-md font-semibold text-purple-600 dark:text-purple-400">
                    {exp.company}
                  </p>
                  {exp.location && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      📍 {exp.location}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(exp.startDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                    {exp.current 
                      ? " - Aujourd'hui" 
                      : exp.endDate 
                        ? ` - ${new Date(exp.endDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}` 
                        : ""
                    }
                  </p>
                </div>
                {exp.current && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                    En cours
                  </span>
                )}
              </div>

              {exp.description && (
                <p className="text-gray-700 dark:text-gray-300 mt-3">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
