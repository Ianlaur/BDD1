import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      studentProfile: true,
      associationProfile: true,
      memberships: {
        include: {
          association: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          {user?.role === "STUDENT"
            ? "Your student dashboard"
            : "Your association dashboard"}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-3xl mb-2">📚</div>
          <h3 className="font-bold text-lg mb-1">Profile</h3>
          <p className="text-sm text-gray-600">
            {user?.role === "STUDENT" ? "Student" : "Association"} Profile
          </p>
        </div>

        {user?.role === "STUDENT" && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-bold text-lg mb-1">
              {user.memberships.length} Memberships
            </h3>
            <p className="text-sm text-gray-600">Associations you've joined</p>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-3xl mb-2">📅</div>
          <h3 className="font-bold text-lg mb-1">Upcoming Events</h3>
          <p className="text-sm text-gray-600">Events you're attending</p>
        </div>
      </div>

      {user?.role === "STUDENT" && user.memberships.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-2xl font-bold mb-4">Your Associations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {user.memberships.map((membership) => (
              <div
                key={membership.id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {membership.association.user.name?.charAt(0) || "A"}
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {membership.association.user.name}
                    </h3>
                    <span className="text-sm text-gray-500 capitalize">
                      {membership.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {user?.memberships.length === 0 && user?.role === "STUDENT" && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold mb-2">Join Your First Association</h2>
          <p className="text-gray-600 mb-6">
            Discover amazing clubs and communities on campus
          </p>
          <a
            href="/associations"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Associations
          </a>
        </div>
      )}
    </div>
  );
}
