import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-black mb-6 text-gray-900 dark:text-gray-100">
            Connect with Campus{" "}
            <span className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Clubs & Associations
            </span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            🎓 Discover student organizations, join communities, attend events, and
            make the most of your campus experience.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/associations"
              className="px-10 py-4 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all text-lg"
            >
              Browse Associations ✨
            </Link>
            <Link
              href="/auth/signup"
              className="px-10 py-4 border-3 border-purple-600 text-purple-700 rounded-full font-bold hover:bg-purple-50 hover:scale-105 transition-all text-lg"
            >
              Get Started 🚀
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-purple-100 dark:border-purple-800">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-black mb-3 text-gray-900 dark:text-gray-100">Discover Organizations</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Browse and search through hundreds of student clubs and associations
              to find your perfect match.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-purple-100 dark:border-purple-800">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-black mb-3 text-gray-900 dark:text-gray-100">Attend Events</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Stay updated with upcoming events, workshops, and activities
              organized by your favorite associations.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-purple-100 dark:border-purple-800">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-2xl font-black mb-3 text-gray-900 dark:text-gray-100">Build Community</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Connect with like-minded students, join discussions, and be part of
              a vibrant campus community.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white dark:bg-gray-800 rounded-3xl p-16 text-center shadow-xl border border-purple-100 dark:border-purple-800">
          <h2 className="text-4xl font-black mb-4 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ready to Get Involved?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Join thousands of students connecting with campus organizations. 🎉
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-12 py-4 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all text-lg"
          >
            Create Account ✨
          </Link>
        </section>
      </div>
    </div>
  );
}
