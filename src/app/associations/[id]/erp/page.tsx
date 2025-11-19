import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ERPDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch association with verification
  const association = await prisma.associationProfile.findUnique({
    where: { id },
    include: {
      user: true,
      teamMembers: { where: { active: true } },
      budgetTransactions: true,
      projects: { include: { tasks: true } },
      meetings: {
        where: {
          startTime: { gte: new Date() },
        },
        take: 5,
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!association) {
    redirect("/associations");
  }

  // Authorization check
  if (association.userId !== session.user.id) {
    redirect(`/associations/${id}`);
  }

  // Calculate statistics
  const activeTeamMembers = association.teamMembers.length;
  const totalProjects = association.projects.length;
  const activeTasks = association.projects.reduce(
    (sum, project) =>
      sum + project.tasks.filter((task) => task.status !== "DONE").length,
    0
  );

  // Budget calculations
  const totalIncome = association.budgetTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = association.budgetTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const upcomingMeetings = association.meetings.length;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/associations/${id}/manage`}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="text-5xl font-black bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🏢 ERP System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage your association&apos;s operations efficiently
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Team Members */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-purple-200 dark:border-purple-900">
            <div className="text-purple-600 dark:text-purple-400 text-2xl mb-2">
              👥
            </div>
            <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-1">
              {activeTeamMembers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Team Members
            </div>
          </div>

          {/* Budget Balance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-green-200 dark:border-green-900">
            <div className="text-green-600 dark:text-green-400 text-2xl mb-2">
              💰
            </div>
            <div
              className={`text-4xl font-black mb-1 ${
                balance >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ${balance.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current Balance
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-900">
            <div className="text-blue-600 dark:text-blue-400 text-2xl mb-2">
              📊
            </div>
            <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-1">
              {totalProjects}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active Projects ({activeTasks} tasks)
            </div>
          </div>

          {/* Meetings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-orange-200 dark:border-orange-900">
            <div className="text-orange-600 dark:text-orange-400 text-2xl mb-2">
              📅
            </div>
            <div className="text-4xl font-black text-orange-600 dark:text-orange-400 mb-1">
              {upcomingMeetings}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Upcoming Meetings
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Team Management */}
          <Link
            href={`/associations/${id}/erp/team`}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-purple-200 dark:border-purple-900 hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-2xl font-black text-purple-600 dark:text-purple-400 mb-2">
              Team Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your team members, roles, and positions
            </p>
            <div className="mt-4 text-purple-600 dark:text-purple-400 font-semibold">
              {activeTeamMembers} active members →
            </div>
          </Link>

          {/* Budget Management */}
          <Link
            href={`/associations/${id}/erp/budget`}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-green-200 dark:border-green-900 hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="text-5xl mb-4">💰</div>
            <h2 className="text-2xl font-black text-green-600 dark:text-green-400 mb-2">
              Budget Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track income, expenses, and financial health
            </p>
            <div className="mt-4 text-green-600 dark:text-green-400 font-semibold">
              ${totalIncome.toFixed(2)} income →
            </div>
          </Link>

          {/* Project Boards */}
          <Link
            href={`/associations/${id}/erp/projects`}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-blue-200 dark:border-blue-900 hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-2">
              Project Boards
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kanban boards for project and task management
            </p>
            <div className="mt-4 text-blue-600 dark:text-blue-400 font-semibold">
              {activeTasks} active tasks →
            </div>
          </Link>

          {/* Calendar */}
          <Link
            href={`/associations/${id}/erp/calendar`}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-orange-200 dark:border-orange-900 hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="text-5xl mb-4">📅</div>
            <h2 className="text-2xl font-black text-orange-600 dark:text-orange-400 mb-2">
              Calendar
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Schedule meetings, events, and deadlines
            </p>
            <div className="mt-4 text-orange-600 dark:text-orange-400 font-semibold">
              {upcomingMeetings} upcoming →
            </div>
          </Link>
        </div>

        {/* Budget Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-black text-green-600 dark:text-green-400 mb-4">
              💵 Total Income
            </h3>
            <div className="text-3xl font-black text-green-600 dark:text-green-400">
              ${totalIncome.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {
                association.budgetTransactions.filter(
                  (t) => t.type === "INCOME"
                ).length
              }{" "}
              transactions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-black text-red-600 dark:text-red-400 mb-4">
              💸 Total Expenses
            </h3>
            <div className="text-3xl font-black text-red-600 dark:text-red-400">
              ${totalExpenses.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {
                association.budgetTransactions.filter(
                  (t) => t.type === "EXPENSE"
                ).length
              }{" "}
              transactions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 mb-4">
              💎 Net Balance
            </h3>
            <div
              className={`text-3xl font-black ${
                balance >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ${balance.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {balance >= 0 ? "Surplus" : "Deficit"}
            </p>
          </div>
        </div>

        {/* Upcoming Meetings */}
        {association.meetings.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-black text-orange-600 dark:text-orange-400 mb-4">
              📅 Upcoming Meetings
            </h3>
            <div className="space-y-3">
              {association.meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 bg-orange-50 dark:bg-gray-700 rounded-xl"
                >
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {meeting.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {meeting.startTime.toLocaleString()} -{" "}
                      {meeting.location || "TBD"}
                    </div>
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">
                    {meeting.attendees.length} attendees
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
