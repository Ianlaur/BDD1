import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JoinAssociationButton } from "@/components/JoinAssociationButton";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssociationInfoPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  // Fetch association with all related data
  const association = await prisma.associationProfile.findUnique({
    where: { id },
    include: {
      user: true,
      memberships: {
        include: {
          user: {
            include: {
              studentProfile: true,
            },
          },
        },
        orderBy: {
          joinedAt: "desc",
        },
      },
      events: {
        orderBy: {
          startDate: "desc",
        },
        take: 5,
      },
      posts: {
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      },
      _count: {
        select: {
          memberships: true,
          events: true,
          posts: true,
        },
      },
    },
  });

  if (!association) {
    notFound();
  }

  // Check if current user is a member
  const isMember = session?.user?.id
    ? association.memberships.some((m) => m.userId === session.user.id)
    : false;

  // Check if user is admin of this association
  const isAdmin =
    session?.user?.id === association.userId ||
    (session?.user?.id &&
      association.memberships.some(
        (m) => m.userId === session.user.id && m.role === "ADMIN"
      ));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-5xl font-bold">{association.user.name}</h1>
              {association.verified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-xl text-blue-100 mb-6">{association.description}</p>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="font-semibold">{association._count.memberships}</span> Members
              </div>
              <div>
                <span className="font-semibold">{association._count.events}</span> Events
              </div>
              <div>
                <span className="font-semibold">{association._count.posts}</span> Posts
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {association.description || "No description provided."}
              </p>
            </div>

            {/* Recent Posts */}
            {association.posts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Recent Posts</h2>
                  <Link
                    href={`/associations/${id}/posts`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {association.posts.map((post) => (
                    <div key={post.id} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-semibold mb-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {post.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            {association.events.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Upcoming Events</h2>
                  <Link
                    href={`/associations/${id}/events`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {association.events.map((event) => (
                    <div
                      key={event.id}
                      className="border rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            event.status === "PUBLISHED"
                              ? "bg-green-100 text-green-800"
                              : event.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📅 {new Date(event.startDate).toLocaleString()}</span>
                        {event.location && <span>📍 {event.location}</span>}
                        {event.capacity && (
                          <span>👥 Max: {event.capacity}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join/Member Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {session ? (
                isMember ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-green-600 text-2xl">✓</span>
                      <span className="font-semibold">You're a member</span>
                    </div>
                    {isAdmin && (
                      <Link
                        href={`/associations/${id}/manage`}
                        className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center mb-2"
                      >
                        Manage Association
                      </Link>
                    )}
                    <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                      Leave Association
                    </button>
                  </div>
                ) : (
                  <JoinAssociationButton associationId={id} />
                )
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Sign in to join this association</p>
                  <Link
                    href="/auth/signin"
                    className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                {association.contactEmail && (
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <a
                      href={`mailto:${association.contactEmail}`}
                      className="block text-blue-600 hover:text-blue-700"
                    >
                      {association.contactEmail}
                    </a>
                  </div>
                )}
                {association.website && (
                  <div>
                    <span className="text-gray-600">Website:</span>
                    <a
                      href={association.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-700"
                    >
                      {association.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {association.socialLinks && association.socialLinks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold mb-4">Social Media</h3>
                <div className="space-y-2">
                  {association.socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      🔗 {new URL(link).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Members Preview */}
            {association.memberships.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Members</h3>
                  <Link
                    href={`/associations/${id}/members`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-2">
                  {association.memberships.slice(0, 5).map((membership) => (
                    <div
                      key={membership.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700">
                        {membership.user.name || membership.user.email}
                      </span>
                      <span className="text-xs text-gray-500">{membership.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
