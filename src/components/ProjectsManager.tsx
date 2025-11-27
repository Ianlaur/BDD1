"use client";

import { useState } from "react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  technologies: string[];
  url: string | null;
  githubUrl: string | null;
  startDate: Date | null;
  endDate: Date | null;
  ongoing: boolean;
}

interface ProjectsManagerProps {
  initialProjects: Project[];
  profileId: string;
}

export default function ProjectsManager({ initialProjects, profileId }: ProjectsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState(initialProjects);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
          🚀 Projets personnels
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
        >
          {showForm ? "✕ Annuler" : "+ Ajouter un projet"}
        </button>
      </div>

      {showForm && (
        <form action="/api/profile/projects/add" method="POST" className="mb-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 space-y-4">
          <input type="hidden" name="profileId" value={profileId} />
          
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Titre du projet *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
              placeholder="Application mobile de gestion"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition resize-none"
              placeholder="Description du projet et de vos contributions..."
            />
          </div>

          <div>
            <label htmlFor="technologies" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Technologies utilisées
            </label>
            <input
              type="text"
              id="technologies"
              name="technologies"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
              placeholder="React, Node.js, PostgreSQL (séparées par des virgules)"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="url" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Lien du projet
              </label>
              <input
                type="url"
                id="url"
                name="url"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                placeholder="https://..."
              />
            </div>
            <div>
              <label htmlFor="githubUrl" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                GitHub
              </label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Date de début
              </label>
              <input
                type="month"
                id="startDate"
                name="startDate"
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
                  name="ongoing"
                  className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  En cours
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
          >
            💾 Enregistrer le projet
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📂</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aucun projet ajouté pour le moment
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ajoutez vos projets personnels pour enrichir votre CV
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {project.startDate && new Date(project.startDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                    {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}`}
                    {project.ongoing && " - En cours"}
                  </p>
                </div>
              </div>

              {project.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {project.description}
                </p>
              )}

              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {(project.url || project.githubUrl) && (
                <div className="flex gap-3">
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      🔗 Voir le projet
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-700 dark:text-gray-300 hover:underline flex items-center gap-1"
                    >
                      🐙 GitHub
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
