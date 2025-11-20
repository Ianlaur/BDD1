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

  // Check if user is admin of this association (owner or board member)
  const isAdmin =
    session?.user?.id === association.userId ||
    (session?.user?.id &&
      association.memberships.some(
        (m) => m.userId === session.user.id && m.role === "board"
      ));

  // Separate board members from regular members (only active members)
  const boardMembers = association.memberships.filter(
    (m) => m.status === "ACTIVE" && m.role === "board"
  );
  const regularMembers = association.memberships.filter(
    (m) => m.status === "ACTIVE" && m.role !== "board"
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner Section with Logo */}
      <div className="relative">
        {/* Banner Image */}
        <div className="h-80 bg-linear-to-br from-[#112a60] to-[#1a3d7a] relative overflow-hidden">
          {association.bannerImage ? (
            <img
              src={association.bannerImage}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#a5dce2] opacity-20 rounded-full -mr-48 -mt-48"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#f67a19] opacity-20 rounded-full -ml-36 -mb-36"></div>
            </div>
          )}
          {/* Edit Banner Button (for admins) */}
          {isAdmin && (
            <Link
              href={`/associations/${id}/edit`}
              className="absolute top-4 right-4 px-4 py-2 bg-white/90 hover:bg-white text-[#112a60] rounded-lg font-bold text-sm transition shadow-lg"
            >
              ✏️ Edit Profile
            </Link>
          )}
        </div>

        {/* Logo Circle - Overlapping Banner */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-24 mb-6">
            <div className="flex items-end gap-6">
              {/* Circle Logo */}
              <div className="relative">
                {association.user.image ? (
                  <img
                    src={association.user.image}
                    alt={association.user.name || "Logo"}
                    className="w-48 h-48 rounded-full border-8 border-white dark:border-gray-900 shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full border-8 border-white dark:border-gray-900 shadow-xl bg-[#f67a19] flex items-center justify-center text-white text-6xl font-black">
                    {association.user.name?.charAt(0) || "A"}
                  </div>
                )}
                {association.verified && (
                  <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg">
                    <svg className="w-6 h-6 text-[#112a60]" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Association Name and Category */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl md:text-5xl font-black text-[#112a60] dark:text-white font-heading">
                    {association.user.name}
                  </h1>
                </div>
                {association.category && (
                  <span className="inline-block px-4 py-1.5 bg-[#a5dce2]/20 text-[#112a60] dark:bg-[#a5dce2]/10 dark:text-[#a5dce2] text-sm font-bold rounded-full border border-[#a5dce2]/30">
                    {association.category}
                  </span>
                )}
                {association.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-3xl">
                    {association.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events - Horizontal Carousel */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-[#112a60] dark:text-white font-heading">
                  📅 Upcoming Events
                </h2>
                {isAdmin && (
                  <Link
                    href={`/associations/${id}/events/create`}
                    className="px-4 py-2 bg-[#f67a19] hover:bg-[#e56910] text-white rounded-lg font-bold text-sm transition"
                  >
                    + Create Event
                  </Link>
                )}
              </div>
              {association.events.length > 0 ? (
                <div className="relative">
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                    {association.events.map((event) => (
                      <div
                        key={event.id}
                        className="flex-none w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 snap-start"
                      >
                        {/* Event Header */}
                        <div className="h-32 bg-linear-to-br from-[#f67a19] to-[#ff8c3a] relative overflow-hidden">
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -mr-12 -mt-12"></div>
                          </div>
                          <div className="absolute bottom-3 left-4 right-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                event.status === "PUBLISHED"
                                  ? "bg-green-500 text-white"
                                  : event.status === "CANCELLED"
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-500 text-white"
                              }`}
                            >
                              {event.status}
                            </span>
                          </div>
                        </div>

                        {/* Event Content */}
                        <div className="p-5">
                          <h3 className="font-black text-lg text-[#112a60] dark:text-white mb-3 line-clamp-2 min-h-14">
                            {event.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-10">
                            {event.description || "No description"}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <span>📅</span>
                              <span className="text-xs">{new Date(event.startDate).toLocaleDateString()}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <span>📍</span>
                                <span className="text-xs line-clamp-1">{event.location}</span>
                              </div>
                            )}
                            {event.capacity && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <span>👥</span>
                                <span className="text-xs">Max: {event.capacity}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-600 dark:text-gray-400">No upcoming events</p>
                </div>
              )}
            </div>

            {/* Recent Posts */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-[#112a60] dark:text-white font-heading">
                  📝 Recent Posts
                </h2>
                {isAdmin && (
                  <Link
                    href={`/associations/${id}/posts/create`}
                    className="px-4 py-2 bg-[#a5dce2] hover:bg-[#8fc9d0] text-[#112a60] rounded-lg font-bold text-sm transition"
                  >
                    + Create Post
                  </Link>
                )}
              </div>
              {association.posts.length > 0 ? (
                <div className="space-y-4">
                  {association.posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-black text-lg text-[#112a60] dark:text-white">
                          {post.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                        {post.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-600 dark:text-gray-400">No posts yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Join Association Button */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              {session ? (
                isMember ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <span className="text-green-600 text-2xl">✓</span>
                      <span className="font-bold text-green-700 dark:text-green-400">You're a member</span>
                    </div>
                    {isAdmin && (
                      <div className="space-y-2 mb-4">
                        <Link
                          href={`/associations/${id}/manage`}
                          className="block w-full px-4 py-3 bg-[#112a60] text-white rounded-xl hover:bg-[#1a3d7a] transition text-center font-bold"
                        >
                          📊 Manage Association
                        </Link>
                        <Link
                          href={`/associations/${id}/erp`}
                          className="block w-full px-4 py-3 bg-[#f67a19] text-white rounded-xl hover:bg-[#e56910] transition text-center font-bold"
                        >
                          🏢 ERP System
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <JoinAssociationButton associationId={id} />
                )
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Sign in to join this association</p>
                  <Link
                    href="/auth/signin"
                    className="block w-full px-4 py-3 bg-[#f67a19] hover:bg-[#e56910] text-white rounded-xl transition text-center font-bold"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-black text-[#112a60] dark:text-white mb-4 font-heading">Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-[#112a60] dark:text-white">
                    {association._count.memberships}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-[#f67a19]">
                    {association._count.events}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-[#a5dce2]">
                    {association._count.posts}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Posts</div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-black text-[#112a60] dark:text-white mb-4 font-heading">Contact Info</h3>
              <div className="space-y-3">
                {association.contactEmail && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📧</span>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">Email</div>
                      <a
                        href={`mailto:${association.contactEmail}`}
                        className="text-sm text-[#f67a19] hover:text-[#e56910] font-semibold break-all"
                      >
                        {association.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
                {association.contactPhone && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📱</span>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">Phone</div>
                      <a
                        href={`tel:${association.contactPhone}`}
                        className="text-sm text-[#f67a19] hover:text-[#e56910] font-semibold"
                      >
                        {association.contactPhone}
                      </a>
                    </div>
                  </div>
                )}
                {association.website && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🌐</span>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">Website</div>
                      <a
                        href={association.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#f67a19] hover:text-[#e56910] font-semibold break-all"
                      >
                        {association.website}
                      </a>
                    </div>
                  </div>
                )}
                {association.socialLinks && association.socialLinks.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🔗</span>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">Social Media</div>
                      <div className="space-y-1">
                        {association.socialLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-[#a5dce2] hover:text-[#8fc9d0] font-semibold truncate"
                          >
                            {new URL(link).hostname}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Board Members */}
            {boardMembers.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-black text-[#112a60] dark:text-white mb-4 font-heading">Board Members</h3>
                <div className="space-y-3">
                  {boardMembers.map((membership) => (
                    <div
                      key={membership.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#f67a19] flex items-center justify-center text-white font-black">
                        {membership.user.name?.charAt(0) || membership.user.email.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {membership.user.name || membership.user.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
                          Board Member
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              association.memberships.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-black text-[#112a60] dark:text-white mb-4 font-heading">Board Members</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No board members assigned yet
                  </p>
                </div>
              )
            )}

            {/* Regular Members */}
            {regularMembers.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-[#112a60] dark:text-white font-heading">Members</h3>
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    {regularMembers.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {regularMembers.slice(0, 8).map((membership) => (
                    <div
                      key={membership.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#a5dce2] flex items-center justify-center text-[#112a60] font-black text-sm">
                        {membership.user.name?.charAt(0) || membership.user.email.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {membership.user.name || membership.user.email}
                        </div>
                      </div>
                    </div>
                  ))}
                  {regularMembers.length > 8 && (
                    <div className="text-center pt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                        +{regularMembers.length - 8} more members
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              boardMembers.length === 0 && association.memberships.filter(m => m.status === "ACTIVE").length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-black text-[#112a60] dark:text-white mb-4 font-heading">Members</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No active members yet
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
