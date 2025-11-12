import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AssociationsPage() {
  const associations = await prisma.associationProfile.findMany({
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Campus Associations</h1>
        <p className="text-gray-600 text-lg">
          Discover and join student organizations that match your interests
        </p>
      </div>

      {associations.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏫</div>
          <h2 className="text-2xl font-bold mb-2">No Associations Yet</h2>
          <p className="text-gray-600 mb-6">
            Be the first to create an association on campus!
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Association
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {associations.map((association) => (
            <div
              key={association.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 relative">
                {association.verified && (
                  <span className="absolute top-2 right-2 bg-white text-blue-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
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

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {association.user.image ? (
                    <img
                      src={association.user.image}
                      alt={association.user.name || ""}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {association.user.name?.charAt(0) || "A"}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">
                      {association.user.name}
                    </h3>
                    {association.category && (
                      <span className="text-sm text-gray-500">
                        {association.category}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {association.description ||
                    "No description available yet."}
                </p>

                <div className="flex gap-4 text-sm text-gray-500 mb-4">
                  <span>
                    👥 {association._count.memberships} members
                  </span>
                  <span>
                    📅 {association._count.events} events
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/associations/${association.id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                  {association.website && (
                    <a
                      href={association.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      title="Visit Website"
                    >
                      🔗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
