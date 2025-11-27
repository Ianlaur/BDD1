"use client";

interface CVGeneratorProps {
  userId: string;
  profileComplete: boolean;
  associationsCount: number;
  interestsCount: number;
}

export default function CVGenerator({
  userId,
  profileComplete,
  associationsCount,
  interestsCount,
}: CVGeneratorProps) {
  const handleGenerateCV = () => {
    window.location.href = `/api/cv/generate?userId=${userId}`;
  };

  const handlePreview = () => {
    window.open(`/api/cv/preview?userId=${userId}`, "_blank");
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/members/${userId}`);
    alert("Lien copié dans le presse-papier !");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">
            📄 Mon CV
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Générez automatiquement votre CV à partir de vos informations de profil
          </p>
        </div>
        <div className="text-5xl">🎓</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* CV Stats */}
        <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
          <div className="text-2xl mb-2">👤</div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-300">
            {profileComplete ? "Complet" : "À compléter"}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Profil</div>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
          <div className="text-2xl mb-2">🏢</div>
          <div className="text-2xl font-black text-purple-700 dark:text-purple-300">
            {associationsCount}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Associations</div>
        </div>

        <div className="bg-linear-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-4 border border-pink-200 dark:border-pink-700">
          <div className="text-2xl mb-2">📚</div>
          <div className="text-2xl font-black text-pink-700 dark:text-pink-300">
            {interestsCount}
          </div>
          <div className="text-xs text-pink-600 dark:text-pink-400 mt-1">Compétences</div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleGenerateCV}
          className="w-full px-6 py-4 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-black rounded-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 group"
        >
          <span className="text-xl">📥</span>
          <span>Générer mon CV (PDF)</span>
          <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
        </button>

        <div className="grid md:grid-cols-2 gap-3">
          <button
            onClick={handlePreview}
            className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>👁️</span>
            <span>Prévisualiser</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>🔗</span>
            <span>Copier le lien</span>
          </button>
        </div>
      </div>

      {/* CV Tips */}
      <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <span>💡</span>
          <span>Conseils pour un CV parfait</span>
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Complétez votre biographie pour une présentation personnalisée</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Ajoutez vos liens LinkedIn et GitHub pour faciliter le contact</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Listez vos centres d'intérêt pour montrer votre personnalité</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">→</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Vos participations associatives seront automatiquement incluses
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
