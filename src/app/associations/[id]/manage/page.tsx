import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <span>/</span>
            <Link
              href={`/associations/${id}`}
              className="hover:text-blue-600"
            >
              {association.user.name}
            </Link>
            <span>/</span>
            <span>Manage</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Manage {association.user.name}
          </h1>
          <p className="text-gray-600">
            Association management dashboard
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Total Members</div>
            <div className="text-3xl font-bold">
              {association._count.memberships}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Active Members</div>
            <div className="text-3xl font-bold text-green-600">
              {activeMemberships.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Pending Requests</div>
            <div className="text-3xl font-bold text-orange-600">
              {pendingMemberships.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Total Events</div>
            <div className="text-3xl font-bold">
              {association._count.events}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              href={`/associations/${id}/edit`}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-2xl mb-2">✏️</div>
              <h3 className="font-semibold">Edit Profile</h3>
            </Link>
            <Link
              href={`/associations/${id}/events/create`}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-semibold">Create Event</h3>
            </Link>
            <Link
              href={`/associations/${id}/posts/create`}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-2xl mb-2">📝</div>
              <h3 className="font-semibold">Create Post</h3>
            </Link>
            <Link
              href={`/associations/${id}/settings`}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold">Settings</h3>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Membership Requests */}
          {pendingMemberships.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">
                Pending Requests ({pendingMemberships.length})
              </h2>
              <div className="space-y-3">
                {pendingMemberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                        {membership.user.name?.charAt(0) ||
                          membership.user.email.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {membership.user.name || membership.user.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          {membership.user.studentProfile?.major || "Student"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition">
                        Approve
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Members */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                Active Members ({activeMemberships.length})
              </h2>
              <Link
                href={`/associations/${id}/members`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {activeMemberships.slice(0, 5).map((membership) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {membership.user.name?.charAt(0) ||
                        membership.user.email.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {membership.user.name || membership.user.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {membership.role || "Member"}
                      </p>
                    </div>
                  </div>
                  <button className="text-sm text-gray-600 hover:text-gray-900">
                    •••
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Events</h2>
              <Link
                href={`/associations/${id}/events`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            {association.events.length > 0 ? (
              <div className="space-y-3">
                {association.events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border rounded-lg hover:shadow-md transition"
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
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                    <Link
                      href={`/associations/${id}/events/${event.id}/edit`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit Event →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No events yet</p>
                <Link
                  href={`/associations/${id}/events/create`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create First Event
                </Link>
              </div>
            )}
          </div>

          {/* Recent Posts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Posts</h2>
              <Link
                href={`/associations/${id}/posts`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            {association.posts.length > 0 ? (
              <div className="space-y-3">
                {association.posts.slice(0, 5).map((post) => (
                  <div
                    key={post.id}
                    className="p-4 border rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{post.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          post.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {post.content}
                    </p>
                    <Link
                      href={`/associations/${id}/posts/${post.id}/edit`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit Post →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No posts yet</p>
                <Link
                  href={`/associations/${id}/posts/create`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create First Post
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
