import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">
          Connect with Campus{" "}
          <span className="text-blue-600">Clubs & Associations</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover student organizations, join communities, attend events, and
          make the most of your campus experience.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/associations"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Browse Associations
          </Link>
          <Link
            href="/auth/signup"
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="p-6 border rounded-lg hover:shadow-lg transition">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2">Discover Organizations</h3>
          <p className="text-gray-600">
            Browse and search through hundreds of student clubs and associations
            to find your perfect match.
          </p>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-xl font-bold mb-2">Attend Events</h3>
          <p className="text-gray-600">
            Stay updated with upcoming events, workshops, and activities
            organized by your favorite associations.
          </p>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-bold mb-2">Build Community</h3>
          <p className="text-gray-600">
            Connect with like-minded students, join discussions, and be part of
            a vibrant campus community.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-50 rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Get Involved?
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Join thousands of students connecting with campus organizations.
        </p>
        <Link
          href="/auth/signup"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Create Account
        </Link>
      </section>
    </div>
  );
}
