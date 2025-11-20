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
    <div className="min-h-screen gradient-mesh">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Modern Header */}
        <div className="mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-[#a5dce2]/20 text-[#112a60] dark:text-[#a5dce2] rounded-full text-sm font-semibold border border-[#a5dce2]/30">
              🎯 Explore Communities
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-[#112a60] dark:text-white font-heading leading-tight">
            Discover Associations
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl md:text-2xl max-w-3xl mb-10 leading-relaxed font-light">
            Explore student organizations and connect with communities that share your passions
          </p>
          
          {/* Stats Overview */}
          {associations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-[#112a60]/50 px-8 py-6 rounded-2xl border border-gray-100 dark:border-[#a5dce2]/20 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#112a60]/10 dark:bg-[#a5dce2]/20 rounded-xl flex items-center justify-center text-2xl">
                    🏛️
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#112a60] dark:text-white">{associations.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Associations</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-[#112a60]/50 px-8 py-6 rounded-2xl border border-gray-100 dark:border-[#a5dce2]/20 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f67a19]/10 rounded-xl flex items-center justify-center text-2xl">
                    👥
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#f67a19]">
                      {associations.reduce((sum, a) => sum + a._count.memberships, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Members</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-[#112a60]/50 px-8 py-6 rounded-2xl border border-gray-100 dark:border-[#a5dce2]/20 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#a5dce2]/20 rounded-xl flex items-center justify-center text-2xl">
                    📅
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#112a60] dark:text-[#a5dce2]">
                      {associations.reduce((sum, a) => sum + a._count.events, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Events</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {associations.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-[#112a60]/50 rounded-3xl border border-gray-100 dark:border-[#a5dce2]/20">
            <div className="text-8xl mb-8">🌟</div>
            <h2 className="text-4xl font-black mb-4 text-[#112a60] dark:text-white font-heading">No Associations Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 text-xl mb-10 max-w-md mx-auto">
              Be a pioneer and create the first association on campus!
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-10 py-5 bg-[#f67a19] hover:bg-[#e56910] text-white rounded-2xl font-bold shadow-lg shadow-[#f67a19]/20 hover:-translate-y-1 transition-all"
            >
              Create Association
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {associations.map((association) => (
              <div
                key={association.id}
                className="bg-white dark:bg-[#112a60]/50 rounded-3xl overflow-hidden border border-gray-100 dark:border-[#a5dce2]/20 card-hover group"
              >
                {/* Header with navy background */}
                <Link href={`/associations/${association.id}`}>
                  <div className="h-40 bg-linear-to-br from-[#112a60] to-[#1a3d7a] relative cursor-pointer overflow-hidden">
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#a5dce2] rounded-full blur-2xl -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#f67a19] rounded-full blur-2xl -ml-12 -mb-12"></div>
                    </div>
                    {association.verified && (
                      <span className="absolute top-4 right-4 glass text-[#112a60] dark:text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-10">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
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
                  <div className="flex justify-center -mt-16 mb-6">
                    <Link href={`/associations/${association.id}`}>
                      <div className="relative cursor-pointer group/logo">
                        {association.user.image ? (
                          <img
                            src={association.user.image}
                            alt={association.user.name || ""}
                            className="w-32 h-32 rounded-2xl border-4 border-white dark:border-[#112a60] shadow-2xl object-cover group-hover/logo:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-[#112a60] shadow-2xl bg-linear-to-br from-[#f67a19] to-[#e56a09] flex items-center justify-center text-white text-4xl font-black group-hover/logo:scale-105 transition-transform">
                            {association.user.name?.charAt(0) || "A"}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Association Info */}
                  <Link href={`/associations/${association.id}`} className="block text-center mb-4">
                    <h3 className="font-black text-2xl mb-3 text-[#112a60] dark:text-white group-hover:text-[#f67a19] transition font-heading">
                      {association.user.name}
                    </h3>
                    {association.category && (
                      <span className="inline-block px-4 py-2 bg-[#a5dce2]/20 text-[#112a60] dark:bg-[#a5dce2]/10 dark:text-[#a5dce2] text-xs font-bold rounded-full border border-[#a5dce2]/30">
                        {association.category}
                      </span>
                    )}
                  </Link>

                  {/* Description */}
                  <Link href={`/associations/${association.id}`}>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2 text-center hover:text-gray-900 dark:hover:text-gray-100 transition leading-relaxed">
                      {association.description || "Join us to discover more!"}
                    </p>
                  </Link>

                  {/* Stats */}
                  <div className="flex justify-center gap-10 mb-6 py-4 bg-gray-50/50 dark:bg-[#112a60]/20 rounded-2xl border border-gray-100 dark:border-[#a5dce2]/10">
                    <div className="text-center">
                      <div className="font-black text-2xl text-[#112a60] dark:text-white mb-1">
                        {association._count.memberships}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Members</div>
                    </div>
                    <div className="w-px bg-gray-200 dark:bg-[#a5dce2]/20"></div>
                    <div className="text-center">
                      <div className="font-black text-2xl text-[#f67a19] mb-1">
                        {association._count.events}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Events</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      href={`/associations/${association.id}`}
                      className="flex-1 px-5 py-3 bg-[#f67a19] hover:bg-[#e56910] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#f67a19]/20 hover:-translate-y-0.5 transition-all text-center"
                    >
                      View Profile
                    </Link>
                    {association.website && (
                      <WebsiteLink
                        href={association.website}
                        className="px-5 py-3 border-2 border-gray-200 dark:border-[#a5dce2]/30 rounded-xl hover:border-[#a5dce2] hover:bg-[#a5dce2]/10 transition-all text-center"
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
