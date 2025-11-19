import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
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

  // If user is an association, redirect to their association profile
  if (user?.role === "ASSOCIATION" && user.associationProfile) {
    redirect(`/associations/${user.associationProfile.id}`);
  }

  async function updateStudentProfile(formData: FormData) {
    "use server";
    
    const session = await auth();
    if (!session?.user) {
      redirect("/auth/signin");
    }

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const major = formData.get("major") as string;
    const graduationYear = formData.get("graduationYear") as string;
    const interests = formData.get("interests") as string;

    // Parse interests
    const interestsArray = interests
      .split(",")
      .map((interest) => interest.trim())
      .filter((interest) => interest.length > 0);

    await prisma.$transaction([
      // Update user name
      prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      }),
      // Upsert student profile
      prisma.studentProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          bio: bio || null,
          major: major || null,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
          interests: interestsArray,
        },
        update: {
          bio: bio || null,
          major: major || null,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
          interests: interestsArray,
        },
      }),
    ]);

    redirect("/profile");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-black shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-black bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text mb-2">
                  {user?.name || "User"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {user?.email}
                </p>
                <div className="flex gap-3">
                  <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-xl font-bold text-sm">
                    {user?.role === "STUDENT" ? "🎓 Student" : "🏢 Association"}
                  </span>
                  {user?.studentProfile?.major && (
                    <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-xl font-bold text-sm">
                      📚 {user.studentProfile.major}
                    </span>
                  )}
                  {user?.studentProfile?.graduationYear && (
                    <span className="px-4 py-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-xl font-bold text-sm">
                      🎯 Class of {user.studentProfile.graduationYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {user?.studentProfile?.bio && (
              <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">About Me</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.studentProfile.bio}
                </p>
              </div>
            )}

            {/* Interests */}
            {user?.studentProfile?.interests && user.studentProfile.interests.length > 0 && (
              <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.studentProfile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-linear-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Edit Profile Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">
                ✏️ Edit Profile
              </h2>
              
              <form action={updateStudentProfile} className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={user?.name || ""}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    defaultValue={user?.studentProfile?.bio || ""}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Major */}
                <div>
                  <label htmlFor="major" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Major / Field of Study
                  </label>
                  <input
                    type="text"
                    id="major"
                    name="major"
                    defaultValue={user?.studentProfile?.major || ""}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                    placeholder="Computer Science"
                  />
                </div>

                {/* Graduation Year */}
                <div>
                  <label htmlFor="graduationYear" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    id="graduationYear"
                    name="graduationYear"
                    defaultValue={user?.studentProfile?.graduationYear || ""}
                    min="2024"
                    max="2030"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                    placeholder="2026"
                  />
                </div>

                {/* Interests */}
                <div>
                  <label htmlFor="interests" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Interests
                  </label>
                  <input
                    type="text"
                    id="interests"
                    name="interests"
                    defaultValue={user?.studentProfile?.interests?.join(", ") || ""}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                    placeholder="Technology, Music, Sports"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Separate interests with commas
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                >
                  💾 Save Changes
                </button>
              </form>
            </div>

            {/* Stats & Activity */}
            <div className="space-y-8">
              {/* Memberships */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">
                  🎯 My Associations
                </h2>
                
                {user?.memberships && user.memberships.length > 0 ? (
                  <div className="space-y-3">
                    {user.memberships.map((membership) => (
                      <Link
                        key={membership.id}
                        href={`/associations/${membership.associationId}`}
                        className="block p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black shadow-md">
                            {membership.association.user.name?.charAt(0) || "A"}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                              {membership.association.user.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {membership.role || "Member"}
                            </p>
                          </div>
                          <span className="text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                            →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You haven't joined any associations yet
                    </p>
                    <Link
                      href="/associations"
                      className="inline-block px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                    >
                      Browse Associations
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Event Registrations */}
              {user?.eventRegistrations && user.eventRegistrations.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">
                    📅 Upcoming Events
                  </h2>
                  
                  <div className="space-y-3">
                    {user.eventRegistrations.slice(0, 3).map((registration) => (
                      <div
                        key={registration.id}
                        className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl"
                      >
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {registration.event.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(registration.event.startDate).toLocaleDateString()} • {registration.event.association.user.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
