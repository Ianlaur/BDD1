import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen gradient-mesh">
      <div className="container mx-auto px-6 py-24 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-32">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-[#a5dce2]/20 text-[#112a60] dark:text-[#a5dce2] rounded-full text-sm font-semibold border border-[#a5dce2]/30">
              ✨ Welcome to Loft
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 text-[#112a60] dark:text-white font-heading leading-tight">
            Connect with
            <br />
            <span className="text-[#f67a19]">Campus Communities</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Discover student organizations, join communities, attend events, and make lasting connections.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/associations"
              className="group px-8 py-4 bg-[#f67a19] text-white rounded-2xl font-semibold hover:bg-[#e56910] transition-all text-lg shadow-lg shadow-[#f67a19]/20 hover:shadow-xl hover:shadow-[#f67a19]/30 hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2">
                Browse Associations
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white dark:bg-[#112a60] text-[#112a60] dark:text-white border-2 border-[#112a60] dark:border-[#a5dce2] rounded-2xl font-semibold hover:-translate-y-0.5 transition-all text-lg"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-6 mb-32">
          <div className="group bg-white dark:bg-[#112a60]/50 p-10 rounded-3xl card-hover border border-gray-100 dark:border-[#a5dce2]/20">
            <div className="w-14 h-14 bg-[#f67a19]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-2xl font-black mb-4 text-[#112a60] dark:text-white font-heading">Discover Organizations</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Browse student clubs and associations to find communities that match your interests and passions.
            </p>
          </div>

          <div className="group bg-white dark:bg-[#112a60]/50 p-10 rounded-3xl card-hover border border-gray-100 dark:border-[#a5dce2]/20">
            <div className="w-14 h-14 bg-[#a5dce2]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="text-2xl font-black mb-4 text-[#112a60] dark:text-white font-heading">Attend Events</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Stay updated with upcoming events, workshops, and activities organized by your favorite associations.
            </p>
          </div>

          <div className="group bg-white dark:bg-[#112a60]/50 p-10 rounded-3xl card-hover border border-gray-100 dark:border-[#a5dce2]/20">
            <div className="w-14 h-14 bg-[#112a60]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🤝</span>
            </div>
            <h3 className="text-2xl font-black mb-4 text-[#112a60] dark:text-white font-heading">Build Community</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Connect with like-minded students and be part of a vibrant campus community.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-linear-to-br from-[#112a60] to-[#1a3d7a] dark:from-[#112a60] dark:to-[#0d1f45] rounded-4xl p-16 text-center overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f67a19]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#a5dce2]/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white font-heading">
              Ready to Get Involved?
            </h2>
            <p className="text-xl text-[#a5dce2] mb-10 max-w-2xl mx-auto">
              Join students connecting with campus organizations and making lasting memories.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-10 py-5 bg-[#f67a19] text-white rounded-2xl font-bold hover:bg-[#e56910] transition-all text-lg shadow-2xl shadow-[#f67a19]/20 hover:-translate-y-1"
            >
              Create Account
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
