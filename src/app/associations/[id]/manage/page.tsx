import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Server action to publish a draft event
async function publishEvent(formData: FormData) {
  "use server";
  
  const eventId = formData.get("eventId") as string;
  const associationId = formData.get("associationId") as string;
  
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Verify ownership
  const association = await prisma.associationProfile.findUnique({
    where: { id: associationId },
  });

  if (!association || association.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Update event status to PUBLISHED
  await prisma.event.update({
    where: { id: eventId },
    data: { status: "PUBLISHED" },
  });

  revalidatePath(`/associations/${associationId}/manage`);
  revalidatePath("/events");
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssociationManagePage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch association with permissions check
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
      },
      posts: {
        orderBy: {
          createdAt: "desc",
        },
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
    redirect("/associations");
  }

  // Check if user has permission to manage
  const isOwner = association.userId === session.user.id;
  const isAdmin =
    session.user.role === "ADMIN" ||
    association.memberships.some(
      (m) => m.userId === session.user.id && m.role === "ADMIN"
    );

  if (!isOwner && !isAdmin) {
    redirect(`/associations/${id}`);
  }

  // Group memberships by status
  const pendingMemberships = association.memberships.filter(
    (m) => m.status === "PENDING"
  );
  const activeMemberships = association.memberships.filter(
    (m) => m.status === "ACTIVE"
  );

  // Group events by status
  const draftEvents = association.events.filter(
    (e) => e.status === "DRAFT"
  );
  const publishedEvents = association.events.filter(
    (e) => e.status === "PUBLISHED"
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link href="/dashboard" className="hover:text-purple-600 dark:hover:text-purple-400 font-medium transition">
              Dashboard
            </Link>
            <span>→</span>
            <Link
              href={`/associations/${id}`}
              className="hover:text-purple-600 dark:hover:text-purple-400 font-medium transition"
            >
              {association.user.name}
            </Link>
            <span>→</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">Manage</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
              {association.user.name?.charAt(0) || "A"}
            </div>
            <div>
              <h1 className="text-4xl font-black mb-2 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Manage {association.user.name}
              </h1>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                🎯 Association management dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl p-6 border border-purple-100 dark:border-purple-800 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Members</div>
              <div className="text-3xl">👥</div>
            </div>
            <div className="text-4xl font-black text-gray-900 dark:text-gray-100">
              {association._count.memberships}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl p-6 border border-green-200 dark:border-green-800 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Active Members</div>
              <div className="text-3xl">✅</div>
            </div>
            <div className="text-4xl font-black text-green-600 dark:text-green-400">
              {activeMemberships.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl p-6 border border-orange-200 dark:border-orange-800 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Pending Requests</div>
              <div className="text-3xl">⏳</div>
            </div>
            <div className="text-4xl font-black text-orange-600 dark:text-orange-400">
              {pendingMemberships.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl p-6 border border-blue-200 dark:border-blue-800 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Events</div>
              <div className="text-3xl">📅</div>
            </div>
            <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
              {association._count.events}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 mb-8 border border-purple-100 dark:border-purple-800">
          <h2 className="text-2xl font-black mb-6 text-gray-900 dark:text-gray-100">⚡ Quick Actions</h2>
          <div className="grid md:grid-cols-5 gap-4">
            <Link
              href={`/associations/${id}/erp`}
              className="p-6 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-center group transform hover:scale-105"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏢</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">ERP System</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Team, Budget, Projects</p>
            </Link>
            <Link
              href={`/associations/${id}/edit`}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-center group transform hover:scale-105"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">✏️</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Edit Profile</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Update info & logo</p>
            </Link>
            <Link
              href={`/associations/${id}/events/create`}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-center group transform hover:scale-105"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📅</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Create Event</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Schedule new event</p>
            </Link>
            <Link
              href={`/associations/${id}/posts/create`}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-center group transform hover:scale-105"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📝</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Create Post</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Share an update</p>
            </Link>
            <Link
              href={`/associations/${id}/settings`}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all text-center group transform hover:scale-105"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚙️</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Settings</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Manage preferences</p>
            </Link>
          </div>
        </div>

        {/* Draft Events Section */}
        {draftEvents.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8 border-2 border-[#a5dce2]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-[#112a60] dark:text-[#a5dce2] font-heading">
                📝 Draft Events
              </h2>
              <span className="px-3 py-1 bg-[#a5dce2]/20 text-[#112a60] dark:text-[#a5dce2] rounded-full text-sm font-bold">
                {draftEvents.length} {draftEvents.length === 1 ? "Draft" : "Drafts"}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              These events are not visible to the public yet. Publish them when you're ready!
            </p>
            <div className="space-y-3">
              {draftEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        📅 {new Date(event.startDate).toLocaleDateString()} {event.location ? `• 📍 ${event.location}` : ""}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-bold">
                      📝 DRAFT
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <form action={publishEvent}>
                      <input type="hidden" name="eventId" value={event.id} />
                      <input type="hidden" name="associationId" value={id} />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#f67a19] hover:bg-[#e56910] text-white text-sm font-bold rounded-lg transition hover:scale-105"
                      >
                        📢 Publish Now
                      </button>
                    </form>
                    <Link
                      href={`/associations/${id}/events/${event.id}/edit`}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm font-bold rounded-lg transition hover:scale-105"
                    >
                      ✏️ Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Membership Requests */}
          {pendingMemberships.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                  ⏳ Pending Requests
                </h2>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full text-sm font-bold">
                  {pendingMemberships.length}
                </span>
              </div>
              <div className="space-y-3">
                {pendingMemberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-md">
                        {membership.user.name?.charAt(0) ||
                          membership.user.email.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          {membership.user.name || membership.user.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {membership.user.studentProfile?.major || "Student"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition hover:scale-105">
                        ✓ Approve
                      </button>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition hover:scale-105">
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Members */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                👥 Active Members
              </h2>
              <Link
                href={`/associations/${id}/members`}
                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {activeMemberships.slice(0, 5).map((membership) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                      {membership.user.name?.charAt(0) ||
                        membership.user.email.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">
                        {membership.user.name || membership.user.email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {membership.role || "Member"}
                      </p>
                    </div>
                  </div>
                  <button className="text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-bold">
                    •••
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Published Events */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">📅 Published Events</h2>
              <Link
                href={`/associations/${id}/events`}
                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
              >
                View All →
              </Link>
            </div>
            {publishedEvents.length > 0 ? (
              <div className="space-y-3">
                {publishedEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{event.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          event.status === "PUBLISHED"
                            ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                            : event.status === "CANCELLED"
                            ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      📅 {new Date(event.startDate).toLocaleDateString()}
                    </p>
                    <Link
                      href={`/associations/${id}/events/${event.id}/edit`}
                      className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
                    >
                      Edit Event →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-lg font-semibold mb-4">No events yet</p>
                <Link
                  href={`/associations/${id}/events/create`}
                  className="inline-block px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Create First Event ✨
                </Link>
              </div>
            )}
          </div>

          {/* Recent Posts */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">📝 Recent Posts</h2>
              <Link
                href={`/associations/${id}/posts`}
                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
              >
                View All →
              </Link>
            </div>
            {association.posts.length > 0 ? (
              <div className="space-y-3">
                {association.posts.slice(0, 5).map((post) => (
                  <div
                    key={post.id}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{post.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          post.published
                            ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {post.published ? "✅ Published" : "📝 Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {post.content}
                    </p>
                    <Link
                      href={`/associations/${id}/posts/${post.id}/edit`}
                      className="text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition"
                    >
                      Edit Post →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg font-semibold mb-4">No posts yet</p>
                <Link
                  href={`/associations/${id}/posts/create`}
                  className="inline-block px-6 py-3 bg-linear-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Create First Post ✨
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
