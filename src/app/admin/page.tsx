import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();

  // Check if user is admin
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch comprehensive statistics
  const [
    totalUsers,
    totalStudents,
    totalAssociations,
    totalAdmins,
    verifiedAssociations,
    totalEvents,
    upcomingEvents,
    pastEvents,
    totalMemberships,
    activeMemberships,
    pendingMemberships,
    inactiveMemberships,
    totalPosts,
    totalEventRegistrations,
    totalNotifications,
    recentUsers,
    recentAssociations,
    topAssociations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.associationProfile.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.associationProfile.count({ where: { verified: true } }),
    prisma.event.count(),
    prisma.event.count({
      where: {
        startDate: { gte: new Date() },
        status: "PUBLISHED",
      },
    }),
    prisma.event.count({
      where: {
        endDate: { lt: new Date() },
      },
    }),
    prisma.membership.count(),
    prisma.membership.count({ where: { status: "ACTIVE" } }),
    prisma.membership.count({ where: { status: "PENDING" } }),
    prisma.membership.count({ where: { status: "INACTIVE" } }),
    prisma.post.count(),
    prisma.eventRegistration.count(),
    prisma.notification.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        studentProfile: true,
        associationProfile: true,
      },
    }),
    prisma.associationProfile.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        _count: {
          select: {
            memberships: true,
            events: true,
          },
        },
      },
    }),
    prisma.associationProfile.findMany({
      take: 5,
      orderBy: {
        memberships: {
          _count: "desc",
        },
      },
      include: {
        user: true,
        _count: {
          select: {
            memberships: true,
            events: true,
            posts: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Platform overview and management • Last updated:{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Users</h3>
              <span className="text-3xl">👥</span>
            </div>
            <p className="text-4xl font-bold mb-2">{totalUsers}</p>
            <div className="text-sm opacity-90">
              <p>{totalStudents} Students</p>
              <p>{totalAssociations} Associations</p>
              <p>{totalAdmins} Admins</p>
            </div>
          </div>

          <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Associations</h3>
              <span className="text-3xl">🏫</span>
            </div>
            <p className="text-4xl font-bold mb-2">{totalAssociations}</p>
            <div className="text-sm opacity-90">
              <p>✓ {verifiedAssociations} Verified</p>
              <p>⏳ {totalAssociations - verifiedAssociations} Unverified</p>
            </div>
            <Link
              href="/admin/associations"
              className="text-sm underline opacity-90 hover:opacity-100 mt-2 inline-block"
            >
              Manage →
            </Link>
          </div>

          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Events</h3>
              <span className="text-3xl">📅</span>
            </div>
            <p className="text-4xl font-bold mb-2">{totalEvents}</p>
            <div className="text-sm opacity-90">
              <p>🔜 {upcomingEvents} Upcoming</p>
              <p>✅ {pastEvents} Completed</p>
            </div>
            <Link
              href="/admin/events"
              className="text-sm underline opacity-90 hover:opacity-100 mt-2 inline-block"
            >
              View All →
            </Link>
          </div>

          <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Memberships</h3>
              <span className="text-3xl">🤝</span>
            </div>
            <p className="text-4xl font-bold mb-2">{totalMemberships}</p>
            <div className="text-sm opacity-90">
              <p>✅ {activeMemberships} Active</p>
              <p>⏳ {pendingMemberships} Pending</p>
              {inactiveMemberships > 0 && <p>❌ {inactiveMemberships} Inactive</p>}
            </div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Total Posts
              </h3>
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalPosts}</p>
            <p className="text-sm text-gray-500 mt-1">
              {totalAssociations > 0
                ? (totalPosts / totalAssociations).toFixed(1)
                : 0}{" "}
              avg per association
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Event Registrations
              </h3>
              <span className="text-2xl">🎟️</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {totalEventRegistrations}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {totalEvents > 0
                ? (totalEventRegistrations / totalEvents).toFixed(1)
                : 0}{" "}
              avg per event
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Notifications
              </h3>
              <span className="text-2xl">🔔</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {totalNotifications}
            </p>
            <p className="text-sm text-gray-500 mt-1">System messages sent</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/admin/associations"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="text-2xl mb-2">🏫</div>
              <h3 className="font-semibold mb-1">Manage Associations</h3>
              <p className="text-sm text-gray-600">
                Verify, edit, or remove associations
              </p>
            </Link>

            <Link
              href="/admin/users"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-semibold mb-1">Manage Users</h3>
              <p className="text-sm text-gray-600">
                View and manage user accounts
              </p>
            </Link>

            <Link
              href="/admin/events"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-semibold mb-1">Manage Events</h3>
              <p className="text-sm text-gray-600">
                Moderate and manage events
              </p>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Users</h2>
              <Link
                href="/admin/users"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name || user.email}</p>
                      <p className="text-sm text-gray-500">
                        {user.role === "STUDENT"
                          ? "Student"
                          : user.role === "ASSOCIATION"
                          ? "Association"
                          : "Admin"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Associations */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Associations</h2>
              <Link
                href="/admin/associations"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentAssociations.map((association) => (
                <div
                  key={association.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{association.user.name}</p>
                    {association.verified && (
                      <span className="text-blue-600 text-xs">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {association._count.memberships} members •{" "}
                    {association._count.events} events
                  </p>
                  <Link
                    href={`/admin/associations/${association.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Manage →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Top Associations */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Top Associations</h2>
              <span className="text-sm text-gray-500">By Members</span>
            </div>
            <div className="space-y-3">
              {topAssociations.map((association, index) => (
                <div
                  key={association.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {association.user.name}
                        </p>
                        {association.verified && (
                          <span className="text-blue-600 text-xs">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 ml-11">
                    <span>👥 {association._count.memberships}</span>
                    <span>📅 {association._count.events}</span>
                    <span>📝 {association._count.posts}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
