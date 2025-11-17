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
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-12">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Campus Associations
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-xl max-w-2xl mx-auto">
            🚀 Discover amazing student organizations and find your community
          </p>
        </div>

        {associations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">�</div>
            <h2 className="text-3xl font-bold mb-4">No Associations Yet</h2>
            <p className="text-gray-600 text-lg mb-8">
              Be a pioneer and create the first association on campus!
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-xl transform hover:scale-105 transition font-semibold"
            >
              Create Association ✨
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {associations.map((association) => (
              <div
                key={association.id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
              >
                {/* Header with gradient background */}
                <Link href={`/associations/${association.id}`}>
                  <div className="h-28 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 relative cursor-pointer">
                    {association.verified && (
                      <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
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
                  <div className="flex justify-center -mt-12 mb-4">
                    <Link href={`/associations/${association.id}`}>
                      <div className="relative group cursor-pointer">
                        {association.user.image ? (
                          <img
                            src={association.user.image}
                            alt={association.user.name || ""}
                            className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black group-hover:scale-105 transition-transform">
                            {association.user.name?.charAt(0) || "A"}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Association Info */}
                  <Link href={`/associations/${association.id}`} className="block text-center mb-4">
                    <h3 className="font-black text-xl mb-1 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition">
                      {association.user.name}
                    </h3>
                    {association.category && (
                      <span className="inline-block px-3 py-1 bg-linear-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full">
                        {association.category}
                      </span>
                    )}
                  </Link>

                  {/* Description */}
                  <Link href={`/associations/${association.id}`}>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 text-center hover:text-gray-900 dark:hover:text-gray-200 transition">
                      {association.description || "Join us to discover more! 🎉"}
                    </p>
                  </Link>

                  {/* Stats */}
                  <div className="flex justify-center gap-6 mb-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="text-center">
                      <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        {association._count.memberships}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Members</div>
                    </div>
                    <div className="w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        {association._count.events}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Events</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/associations/${association.id}`}
                      className="flex-1 px-4 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition text-center"
                    >
                      View Profile
                    </Link>
                    {association.website && (
                      <WebsiteLink
                        href={association.website}
                        className="px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-center"
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
