import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { WebsiteLink } from "@/components/WebsiteLink";

// Force dynamic rendering - don't statically generate this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type AssociationWithDetails = Prisma.AssociationProfileGetPayload<{
  include: {
    user: true;
    _count: {
      select: {
        memberships: true;
        events: true;
      };
    };
  };
}>;

export default async function AssociationsPage() {
  let associations: AssociationWithDetails[] = [];
  let error = null;

  try {
    associations = await prisma.associationProfile.findMany({
      include: {
        user: true,
        _count: {
          select: {
            memberships: true,
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (e) {
    console.error("Database error in associations page:", e);
    error = e instanceof Error ? e.message : "Failed to load associations";
    associations = [];
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold mb-4">Database Connection Error</h1>
          <p className="text-gray-600 mb-6">
            We're having trouble connecting to the database. Please check your configuration.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-red-800 font-mono">{error}</p>
          </div>
          <div className="text-sm text-gray-500 space-y-2">
            <p>Common fixes:</p>
            <ul className="list-disc list-inside text-left max-w-md mx-auto">
              <li>Verify DATABASE_URL environment variable is set</li>
              <li>Check database is accessible from Vercel</li>
              <li>Ensure connection string includes ?sslmode=require</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:from-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Modern Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-black mb-4 text-[#112a60] dark:text-white font-heading">
            Discover Associations
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-3xl mb-8">
            🎓 Explore student organizations and connect with communities that share your passions
          </p>
          
          {/* Stats Overview */}
          {associations.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🏛️</div>
                  <div>
                    <div className="text-2xl font-black text-[#112a60] dark:text-white">{associations.length}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Total Associations</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">👥</div>
                  <div>
                    <div className="text-2xl font-black text-[#f67a19]">
                      {associations.reduce((sum, a) => sum + a._count.memberships, 0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Total Members</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📅</div>
                  <div>
                    <div className="text-2xl font-black text-[#a5dce2] dark:text-[#a5dce2]">
                      {associations.reduce((sum, a) => sum + a._count.events, 0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Total Events</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {associations.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <div className="text-8xl mb-6">🌟</div>
            <h2 className="text-3xl font-black mb-4 text-[#112a60] dark:text-white font-heading">No Associations Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
              Be a pioneer and create the first association on campus!
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-[#f67a19] hover:bg-[#e56910] text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition"
            >
              Create Association ✨
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {associations.map((association) => (
              <div
                key={association.id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#f67a19] group"
              >
                {/* Header with navy background */}
                <Link href={`/associations/${association.id}`}>
                  <div className="h-32 bg-linear-to-br from-[#112a60] to-[#1a3d7a] relative cursor-pointer overflow-hidden">
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#a5dce2] rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#f67a19] rounded-full -ml-12 -mb-12"></div>
                    </div>
                    {association.verified && (
                      <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[#112a60] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-10">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                </Link>

                {/* Logo & Content Container */}
                <div className="relative px-6 pb-6">
                  {/* Logo - Overlapping the header */}
                  <div className="flex justify-center -mt-14 mb-4">
                    <Link href={`/associations/${association.id}`}>
                      <div className="relative cursor-pointer">
                        {association.user.image ? (
                          <img
                            src={association.user.image}
                            alt={association.user.name || ""}
                            className="w-28 h-28 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl bg-[#f67a19] flex items-center justify-center text-white text-4xl font-black group-hover:scale-105 transition-transform">
                            {association.user.name?.charAt(0) || "A"}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Association Info */}
                  <Link href={`/associations/${association.id}`} className="block text-center mb-3">
                    <h3 className="font-black text-xl mb-2 text-[#112a60] dark:text-white group-hover:text-[#f67a19] transition font-heading">
                      {association.user.name}
                    </h3>
                    {association.category && (
                      <span className="inline-block px-3 py-1.5 bg-[#a5dce2]/20 text-[#112a60] dark:bg-[#a5dce2]/10 dark:text-[#a5dce2] text-xs font-bold rounded-full border border-[#a5dce2]/30">
                        {association.category}
                      </span>
                    )}
                  </Link>

                  {/* Description */}
                  <Link href={`/associations/${association.id}`}>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 line-clamp-2 text-center hover:text-gray-900 dark:hover:text-gray-200 transition">
                      {association.description || "Join us to discover more! 🎉"}
                    </p>
                  </Link>

                  {/* Stats */}
                  <div className="flex justify-center gap-8 mb-5 py-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="text-center">
                      <div className="font-black text-xl text-[#112a60] dark:text-white">
                        {association._count.memberships}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Members</div>
                    </div>
                    <div className="w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div className="text-center">
                      <div className="font-black text-xl text-[#112a60] dark:text-white">
                        {association._count.events}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Events</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/associations/${association.id}`}
                      className="flex-1 px-4 py-2.5 bg-[#f67a19] hover:bg-[#e56910] text-white text-sm font-bold rounded-xl hover:shadow-lg transition text-center"
                    >
                      View Profile
                    </Link>
                    {association.website && (
                      <WebsiteLink
                        href={association.website}
                        className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#a5dce2] hover:bg-[#a5dce2]/10 transition text-center"
                        title="Visit Website"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
