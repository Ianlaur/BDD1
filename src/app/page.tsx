import Link from "next/link";
import { SchoolLogo } from "@/components/SchoolLogo";
import { NearbyEvents } from "@/components/NearbyEvents";

export default async function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/assets/hero.png" 
            alt="Campus community" 
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay - darker left to lighter right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#112a60]/95 via-[#112a60]/70 to-[#112a60]/30"></div>
        </div>

        {/* Logo - Top Right */}
        <div className="absolute top-8 right-8 md:top-12 md:right-12 z-10">
          <div className="flex items-center gap-4">
            <img src="/assets/logo-white.svg" alt="Loft Logo" className="h-16 md:h-20 w-auto drop-shadow-2xl" />
            <span className="text-4xl md:text-5xl font-black text-white font-heading drop-shadow-2xl leading-none">Loft</span>
          </div>
        </div>

        {/* Hero Content - Aligned Left */}
        <div className="relative h-full container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="h-full flex items-center">
            <div className="max-w-3xl pr-8 md:pr-16 lg:pr-24">
              <h1 className="text-5xl md:text-7xl font-black mb-6 text-white font-heading leading-tight drop-shadow-2xl">
                Connect with
                <br />
                <span className="text-[#f67a19]">Campus Communities</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed font-light drop-shadow-lg max-w-2xl">
                Discover student organizations, join communities, attend events, and make lasting connections.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/associations"
                  className="group px-8 py-4 bg-[#f67a19] text-white rounded-2xl font-semibold hover:bg-[#e56910] transition-all text-lg shadow-lg shadow-[#f67a19]/30 hover:shadow-xl hover:shadow-[#f67a19]/50 hover:-translate-y-0.5"
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
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-2xl font-semibold hover:bg-white/20 hover:-translate-y-0.5 transition-all text-lg"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of content with gradient background */}
      <div className="gradient-mesh">
        <div className="container mx-auto px-6 py-24 max-w-7xl">

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

        {/* Events Near You Section */}
        <section className="mb-32">
          <NearbyEvents />
        </section>

        {/* School Logos Carousel */}
        <section className="mb-32 relative overflow-hidden -mx-6 md:-mx-12">
          <div className="text-center mb-16 px-6 md:px-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-[#112a60] dark:text-white font-heading">
              Trusted by Schools Worldwide
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of students across these prestigious institutions
            </p>
          </div>

          {/* Gradient overlays for fade effect - Full width */}
          <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-linear-to-r from-[#fafafa] dark:from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-linear-to-l from-[#fafafa] dark:from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>

          {/* Infinite Scroll Carousel */}
          <div className="relative">
            <div className="flex gap-12 animate-scroll">
              {/* First set of logos */}
              {[
                { name: 'School 1', url: 'https://school1.com', logo: '/assets/schools/logoeugenia.png' },
                { name: 'School 2', url: 'https://school2.com', logo: '/assets/schools/logoeugenia.png' },
                { name: 'School 3', url: 'https://school3.com', logo: '/assets/schools/albertschool.png' },
                { name: 'School 4', url: 'https://school4.com', logo: '/assets/schools/logoeugenia.png' },
                { name: 'School 5', url: 'https://school5.com', logo: '/assets/schools/logoeugenia.png' },
                { name: 'School 6', url: 'https://school6.com', logo: '/assets/schools/logoeugenia.png' },
                { name: 'School 7', url: 'https://school7.com', logo: '/assets/schools/logoeugenia.png' },
                { name: 'School 8', url: 'https://school8.com', logo: '/assets/schools/logoeugenia.png' },
              ].map((school, idx) => (
                <SchoolLogo key={`logo-${idx}`} {...school} />
              ))}
              {/* Duplicate set for seamless loop */}
              {[
                { name: 'School 1', url: 'https://school1.com', logo: '/assets/schools/logoeugenia.png' },
                { name: 'School 2', url: 'https://school2.com', logo: '/assets/schools/logoeugenia.png' },
                { name: 'School 3', url: 'https://school3.com', logo: '/assets/schools/albertschool.png' },
                { name: 'School 4', url: 'https://school4.com', logo: '/assets/schools/logoeugenia.png' },
                { name: 'School 5', url: 'https://school5.com', logo: '/assets/schools/logoeugenia.png' },
                { name: 'School 6', url: 'https://school6.com', logo: '/assets/schools/logoeugenia.png' },
                { name: 'School 7', url: 'https://school7.com', logo: '/assets/schools/logoeugenia.png' },
                { name: 'School 8', url: 'https://school8.com', logo: '/assets/schools/logoeugenia.png' },
              ].map((school, idx) => (
                <SchoolLogo key={`logo-duplicate-${idx}`} {...school} />
              ))}
            </div>
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
    </div>
  );
}
