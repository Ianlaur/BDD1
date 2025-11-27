import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ShareProfileLink from "@/components/ShareProfileLink";
import CVGenerator from "@/components/CVGenerator";
import ProjectsManager from "@/components/ProjectsManager";
import ExperiencesManager from "@/components/ExperiencesManager";
import { ProfileStatus, SchoolName } from "@prisma/client";

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
      studentProfile: {
        include: {
          projects: {
            orderBy: {
              startDate: "desc",
            },
          },
          experiences: {
            orderBy: {
              startDate: "desc",
            },
          },
        },
      },
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
    const school = formData.get("school") as string;
    const program = formData.get("program") as string;
    const programYear = formData.get("programYear") as string;
    const hasAssociationExperience = formData.get("hasAssociationExperience") === "on";
    const linkedinUrl = formData.get("linkedinUrl") as string;
    const githubUrl = formData.get("githubUrl") as string;
    const profileStatus = formData.get("profileStatus") as string;
    const avatarUrl = formData.get("avatarUrl") as string;

    // Parse interests
    const interestsArray = interests
      .split(",")
      .map((interest) => interest.trim())
      .filter((interest) => interest.length > 0);

    const schoolValue =
      school === SchoolName.ALBERT || school === SchoolName.EUGENIA ? school : null;
    const statusValue =
      profileStatus === ProfileStatus.PROFESSOR || profileStatus === ProfileStatus.STUDENT
        ? profileStatus
        : null;
    const parsedProgramYear = programYear ? parseInt(programYear, 10) : null;
    const parsedGraduationYear = graduationYear ? parseInt(graduationYear, 10) : null;

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
          graduationYear: parsedGraduationYear,
          interests: interestsArray,
          school: schoolValue,
          program: program || null,
          programYear: parsedProgramYear,
          hasAssociationExperience,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          profileStatus: statusValue,
          avatarUrl: avatarUrl || null,
        },
        update: {
          bio: bio || null,
          major: major || null,
          graduationYear: parsedGraduationYear,
          interests: interestsArray,
          school: schoolValue,
          program: program || null,
          programYear: parsedProgramYear,
          hasAssociationExperience,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          profileStatus: statusValue,
          avatarUrl: avatarUrl || null,
        },
      }),
    ]);

    redirect("/profile");
  }

  const SCHOOL_LABELS: Record<SchoolName, string> = {
    [SchoolName.ALBERT]: "Albert School",
    [SchoolName.EUGENIA]: "Eugenia",
  };

  const STATUS_LABELS: Record<ProfileStatus, string> = {
    [ProfileStatus.STUDENT]: "🎓 Étudiant",
    [ProfileStatus.PROFESSOR]: "👨‍🏫 Professeur",
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              {user?.studentProfile?.avatarUrl ? (
                <img
                  src={user.studentProfile.avatarUrl}
                  alt={user.name || "Avatar"}
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg border-4 border-white dark:border-gray-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-black shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              
              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-black bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text mb-2">
                  {user?.name || "User"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {user?.email}
                </p>
                <div className="flex flex-wrap gap-3">
                  {user?.studentProfile?.profileStatus ? (
                    <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-xl font-bold text-sm">
                      {STATUS_LABELS[user.studentProfile.profileStatus]}
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-xl font-bold text-sm">
                      {user?.role === "STUDENT" ? "🎓 Student" : "🏢 Association"}
                    </span>
                  )}
                  {user?.studentProfile?.school && (
                    <span className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-xl font-bold text-sm">
                      🏫 {SCHOOL_LABELS[user.studentProfile.school]}
                    </span>
                  )}
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

            {user?.id && (
              <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200 dark:border-gray-700 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <ShareProfileLink userId={user.id} />
                <Link
                  href={`/members/${user.id}`}
                  className="inline-flex items-center justify-center px-4 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition"
                >
                  👁️ Voir mon profil public
                </Link>
              </div>
            )}

            {user?.studentProfile?.program && (
              <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Programme</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.studentProfile.program}
                  {user.studentProfile.programYear && (
                    <span className="ml-2 inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-200">
                      Année {user.studentProfile.programYear}
                    </span>
                  )}
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

            {user?.studentProfile?.hasAssociationExperience && (
              <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Expérience associative
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  ✅ Déjà membre d’une association auparavant
                </p>
              </div>
            )}

            {(user?.studentProfile?.linkedinUrl || user?.studentProfile?.githubUrl) && (
              <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Liens</h3>
                <div className="flex flex-wrap gap-3">
                  {user.studentProfile?.linkedinUrl && (
                    <Link
                      href={user.studentProfile.linkedinUrl}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-700 dark:text-blue-300 rounded-full font-semibold hover:bg-blue-600/20"
                    >
                      🔗 LinkedIn
                    </Link>
                  )}
                  {user.studentProfile?.githubUrl && (
                    <Link
                      href={user.studentProfile.githubUrl}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/10 text-gray-800 dark:text-gray-200 rounded-full font-semibold hover:bg-gray-900/20"
                    >
                      🐙 GitHub
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CV Generator Section */}
          <CVGenerator
            userId={user?.id || ""}
            profileComplete={!!user?.studentProfile}
            associationsCount={user?.memberships?.length || 0}
            interestsCount={user?.studentProfile?.interests?.length || 0}
          />

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

                {/* Avatar URL */}
                <div>
                  <label htmlFor="avatarUrl" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Photo de profil (URL)
                  </label>
                  <input
                    type="url"
                    id="avatarUrl"
                    name="avatarUrl"
                    defaultValue={user?.studentProfile?.avatarUrl || ""}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                    placeholder="https://..."
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="profileStatus" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    id="profileStatus"
                    name="profileStatus"
                    defaultValue={user?.studentProfile?.profileStatus || ""}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                  >
                    <option value="">Sélectionner</option>
                    <option value={ProfileStatus.STUDENT}>Étudiant</option>
                    <option value={ProfileStatus.PROFESSOR}>Professeur</option>
                  </select>
                </div>

                {/* School */}
                <div>
                  <label htmlFor="school" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    École
                  </label>
                  <select
                    id="school"
                    name="school"
                    defaultValue={user?.studentProfile?.school || ""}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                  >
                    <option value="">Sélectionner</option>
                    <option value={SchoolName.ALBERT}>Albert</option>
                    <option value={SchoolName.EUGENIA}>Eugenia</option>
                  </select>
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

                {/* Program */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="program" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Programme
                    </label>
                    <input
                      type="text"
                      id="program"
                      name="program"
                      defaultValue={user?.studentProfile?.program || ""}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                      placeholder="Programme Grande École"
                    />
                  </div>
                  <div>
                    <label htmlFor="programYear" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Année du programme
                    </label>
                    <input
                      type="number"
                      id="programYear"
                      name="programYear"
                      min="1"
                      max="6"
                      defaultValue={user?.studentProfile?.programYear || ""}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                      placeholder="1"
                    />
                  </div>
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

                {/* Association Experience */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasAssociationExperience"
                    name="hasAssociationExperience"
                    defaultChecked={user?.studentProfile?.hasAssociationExperience || false}
                    className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="hasAssociationExperience" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    J’ai déjà fait partie d’une association
                  </label>
                </div>

                {/* Social Links */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="linkedinUrl" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      id="linkedinUrl"
                      name="linkedinUrl"
                      defaultValue={user?.studentProfile?.linkedinUrl || ""}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label htmlFor="githubUrl" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      GitHub
                    </label>
                    <input
                      type="url"
                      id="githubUrl"
                      name="githubUrl"
                      defaultValue={user?.studentProfile?.githubUrl || ""}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                      placeholder="https://github.com/..."
                    />
                  </div>
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

          {/* Projects and Experiences Section */}
          {user?.studentProfile && (
            <div className="grid lg:grid-cols-2 gap-8 mt-8">
              <ExperiencesManager
                initialExperiences={user.studentProfile.experiences || []}
                profileId={user.studentProfile.id}
              />
              <ProjectsManager
                initialProjects={user.studentProfile.projects || []}
                profileId={user.studentProfile.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
