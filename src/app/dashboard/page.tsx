import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      studentProfile: true,
      associationProfile: {
        include: {
          memberships: true,
          events: true,
          posts: true,
          teamMembers: true,
          budgetTransactions: true,
          projects: {
            include: {
              tasks: true,
            },
          },
          meetings: true,
        },
      },
      memberships: {
        include: {
          association: {
            include: {
              user: true,
            },
          },
        },
        where: {
          status: "ACTIVE",
        },
      },
      eventRegistrations: {
        include: {
          event: {
            include: {
              association: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: {
          registeredAt: "desc",
        },
        take: 5,
      },
    },
  });

  // Get upcoming events
  const upcomingEvents = user?.eventRegistrations.filter(
    (reg) => new Date(reg.event.startDate) >= new Date()
  ) || [];

  // Get pending membership requests for students
  const pendingMemberships = await prisma.membership.count({
    where: {
      userId: session.user.id,
      status: "PENDING",
    },
  });

  // Association statistics
  const associationStats = user?.associationProfile ? {
    totalMembers: user.associationProfile.memberships.length,
    activeMembers: user.associationProfile.memberships.filter(m => m.status === "ACTIVE").length,
    pendingMembers: user.associationProfile.memberships.filter(m => m.status === "PENDING").length,
    totalEvents: user.associationProfile.events.length,
    upcomingEvents: user.associationProfile.events.filter(e => new Date(e.startDate) >= new Date()).length,
    totalPosts: user.associationProfile.posts.length,
    teamSize: user.associationProfile.teamMembers.filter(t => t.active).length,
    totalBudget: user.associationProfile.budgetTransactions.reduce((acc, t) => {
      return t.type === "INCOME" ? acc + t.amount : acc - t.amount;
    }, 0),
    activeProjects: user.associationProfile.projects.filter(p => p.status === "active").length,
    completedTasks: user.associationProfile.projects.reduce((acc, p) => 
      acc + p.tasks.filter(t => t.status === "DONE").length, 0
    ),
    upcomingMeetings: user.associationProfile.meetings.filter(m => new Date(m.startTime) >= new Date()).length,
  } : null;

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-[#112a60] dark:text-white mb-4 font-heading">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xl">
            {user?.role === "STUDENT"
              ? "Your personalized student dashboard"
              : "Your association management hub"}
          </p>
        </div>

        {/* Association Profile Card */}
        {user?.role === "ASSOCIATION" && user.associationProfile && (
          <div className="bg-white dark:bg-[#112a60]/50 rounded-3xl p-10 mb-10 border border-gray-100 dark:border-[#a5dce2]/20 card-hover">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-[#f67a19] to-[#e56a09] flex items-center justify-center text-white text-3xl font-black shadow-lg">
                  {user.name?.charAt(0) || "A"}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-[#112a60] dark:text-white mb-3 font-heading">
                    {user.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                    <span className="px-4 py-1.5 bg-[#a5dce2]/20 text-[#112a60] dark:text-[#a5dce2] rounded-full font-semibold border border-[#a5dce2]/30">
                      {user.associationProfile.category}
                    </span>
                    {user.associationProfile.verified && (
                      <span className="px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-semibold flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  {user.associationProfile.description && (
                    <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl leading-relaxed">
                      {user.associationProfile.description}
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={`/associations/${user.associationProfile.id}/edit`}
                className="px-6 py-3 bg-[#f67a19] hover:bg-[#e56a09] text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-[#f67a19]/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </Link>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#112a60]/5 dark:bg-[#112a60]/30 rounded-2xl p-5 border border-[#112a60]/10 dark:border-[#112a60]/20">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Members</div>
                <div className="text-3xl font-black text-[#112a60] dark:text-white">
                  {associationStats?.totalMembers || 0}
                </div>
              </div>
              <div className="bg-[#f67a19]/5 dark:bg-[#f67a19]/10 rounded-2xl p-5 border border-[#f67a19]/20">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Events</div>
                <div className="text-3xl font-black text-[#f67a19]">
                  {associationStats?.totalEvents || 0}
                </div>
              </div>
              <div className="bg-[#a5dce2]/10 dark:bg-[#a5dce2]/10 rounded-2xl p-5 border border-[#a5dce2]/30">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Posts</div>
                <div className="text-3xl font-black text-[#112a60] dark:text-[#a5dce2]">
                  {associationStats?.totalPosts || 0}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 border border-green-200 dark:border-green-800">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Budget</div>
                <div className="text-3xl font-black text-green-600 dark:text-green-400">
                  ${associationStats?.totalBudget.toFixed(0) || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics & Graphs for Association */}
        {user?.role === "ASSOCIATION" && associationStats && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Membership Growth */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-[#112a60]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-[#112a60] dark:text-white">👥 Membership</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                  <span className="text-xl font-black text-green-600">{associationStats.activeMembers}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(associationStats.activeMembers / Math.max(associationStats.totalMembers, 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Pending: {associationStats.pendingMembers}</span>
                  <span className="text-gray-600 dark:text-gray-400">Total: {associationStats.totalMembers}</span>
                </div>
              </div>
            </div>

            {/* Events Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-[#f67a19]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-[#f67a19]">📅 Events</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming</span>
                  <span className="text-xl font-black text-[#f67a19]">{associationStats.upcomingEvents}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-[#f67a19] h-2 rounded-full transition-all"
                    style={{ width: `${(associationStats.upcomingEvents / Math.max(associationStats.totalEvents, 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Events</span>
                  <span className="text-gray-600 dark:text-gray-400">{associationStats.totalEvents}</span>
                </div>
              </div>
            </div>

            {/* Project Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-[#a5dce2]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-[#a5dce2]">📋 Projects</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                  <span className="text-xl font-black text-[#a5dce2]">{associationStats.activeProjects}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-[#a5dce2] h-2 rounded-full transition-all"
                    style={{ width: `${associationStats.activeProjects > 0 ? 75 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tasks Done: {associationStats.completedTasks}</span>
                  <span className="text-gray-600 dark:text-gray-400">Team: {associationStats.teamSize}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link
            href="/profile"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl hover:scale-105 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-gray-600 dark:text-gray-400">My Profile</div>
              <div className="text-4xl group-hover:scale-110 transition-transform">👤</div>
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {user?.role === "STUDENT" ? "Student" : "Association"}
            </div>
          </Link>

          {user?.role === "STUDENT" && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Associations</div>
                  <div className="text-4xl">🎯</div>
                </div>
                <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
                  {user.memberships.length}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Upcoming Events</div>
                  <div className="text-4xl">📅</div>
                </div>
                <div className="text-4xl font-black text-green-600 dark:text-green-400">
                  {upcomingEvents.length}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-2 border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Pending</div>
                  <div className="text-4xl">⏳</div>
                </div>
                <div className="text-4xl font-black text-orange-600 dark:text-orange-400">
                  {pendingMemberships}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">{/* Content sections will follow */}

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Your Associations */}
            {user?.role === "STUDENT" && user.memberships.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-6">
                  🎯 Your Associations
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {user.memberships.map((membership) => (
                    <Link
                      key={membership.id}
                      href={`/associations/${membership.associationId}`}
                      className="p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-md">
                          {membership.association.user.name?.charAt(0) || "A"}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                            {membership.association.user.name}
                          </h3>
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize font-semibold">
                            {membership.role || "Member"}
                          </span>
                        </div>
                        <span className="text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition text-xl">
                          →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {user?.memberships.length === 0 && user?.role === "STUDENT" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                <div className="text-8xl mb-6">🎯</div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-3">
                  Join Your First Association
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                  Discover amazing clubs and communities on campus
                </p>
                <Link
                  href="/associations"
                  className="inline-block px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all text-lg"
                >
                  Browse Associations 🚀
                </Link>
              </div>
            )}

            {/* Upcoming Events */}
            {user?.role === "STUDENT" && upcomingEvents.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">
                    📅 Upcoming Events
                  </h2>
                  <Link
                    href="/events"
                    className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((registration) => (
                    <div
                      key={registration.id}
                      className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition"
                    >
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {registration.event.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          📅 {new Date(registration.event.startDate).toLocaleDateString()}
                        </span>
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          {registration.event.association.user.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">
                ⚡ Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/profile"
                  className="block p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-center font-bold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  👤 Edit Profile
                </Link>
                <Link
                  href="/associations"
                  className="block p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-center font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  🔍 Browse Associations
                </Link>
                <Link
                  href="/events"
                  className="block p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-center font-bold text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                >
                  📅 View Events
                </Link>
              </div>
            </div>

            {/* Profile Summary */}
            {user?.studentProfile && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">
                  📚 Profile Summary
                </h2>
                <div className="space-y-4">
                  {user.studentProfile.major && (
                    <div>
                      <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Major</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {user.studentProfile.major}
                      </div>
                    </div>
                  )}
                  {user.studentProfile.graduationYear && (
                    <div>
                      <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Class of</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {user.studentProfile.graduationYear}
                      </div>
                    </div>
                  )}
                  {user.studentProfile.interests && user.studentProfile.interests.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Interests</div>
                      <div className="flex flex-wrap gap-2">
                        {user.studentProfile.interests.slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-linear-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
