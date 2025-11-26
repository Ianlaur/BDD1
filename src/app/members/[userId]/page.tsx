import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProfileStatus, SchoolName } from "@prisma/client";

type MemberProfilePageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MemberProfilePage({
  params,
}: MemberProfilePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
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
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isOwner = user.id === session.user.id;
  const upcomingEvents =
    user.eventRegistrations
      ?.filter((registration) => {
        const date = new Date(registration.event.startDate);
        return date >= new Date();
      })
      .slice(0, 3) ?? [];

  const SCHOOL_LABELS: Record<SchoolName, string> = {
    [SchoolName.ALBERT]: "Albert School",
    [SchoolName.EUGENIA]: "Eugenia",
  };

  const STATUS_LABELS: Record<ProfileStatus, string> = {
    [ProfileStatus.STUDENT]: "🎓 Étudiant",
    [ProfileStatus.PROFESSOR]: "👨‍🏫 Professeur",
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-purple-100 dark:border-purple-900/40">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex items-start gap-4">
              {user.studentProfile?.avatarUrl ? (
                <img
                  src={user.studentProfile.avatarUrl}
                  alt={user.name || "Avatar"}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg border-4 border-white dark:border-gray-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-semibold">
                  Profil membre
                </p>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mt-1">
                  {user.name || "Utilisateur"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {user.studentProfile?.profileStatus ? (
                    <span className="px-4 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-black tracking-wide">
                      {STATUS_LABELS[user.studentProfile.profileStatus]}
                    </span>
                  ) : (
                    <span className="px-4 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-black tracking-wide">
                      {user.role === "STUDENT" ? "🎓 Étudiant" : "🏢 Association"}
                    </span>
                  )}
                  {user.studentProfile?.school && (
                    <span className="px-4 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-black">
                      🏫 {SCHOOL_LABELS[user.studentProfile.school]}
                    </span>
                  )}
                  {user.studentProfile?.major && (
                    <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-black">
                      📚 {user.studentProfile.major}
                    </span>
                  )}
                  {user.studentProfile?.graduationYear && (
                    <span className="px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-black">
                      🎯 Promotion {user.studentProfile.graduationYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isOwner && (
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-5 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:scale-105 transition"
              >
                ✏️ Mettre à jour mon profil
              </Link>
            )}
          </div>

          {user.studentProfile?.bio && (
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                À propos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {user.studentProfile.bio}
              </p>
            </div>
          )}

          {user.studentProfile?.program && (
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Programme
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {user.studentProfile.program}
                {user.studentProfile.programYear && (
                  <span className="ml-2 inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-200">
                    Année {user.studentProfile.programYear}
                  </span>
                )}
              </p>
            </div>
          )}

          {user.studentProfile?.interests &&
            user.studentProfile.interests.length > 0 && (
              <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3">
                  Centres d’intérêt
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.studentProfile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-4 py-1.5 bg-linear-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-200 rounded-full text-sm font-semibold"
                    >
                      #{interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {user.studentProfile?.hasAssociationExperience && (
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Expérience associative
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                ✅ Déjà membre d’une association auparavant
              </p>
            </div>
          )}

          {(user.studentProfile?.linkedinUrl || user.studentProfile?.githubUrl) && (
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3">
                Liens
              </h2>
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

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                👥 Associations
              </h2>
              {user.memberships.length > 0 && (
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {user.memberships.length} actives
                </span>
              )}
            </div>
            {user.memberships.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                Pas encore membre d’une association.
              </p>
            ) : (
              <div className="space-y-3">
                {user.memberships.map((membership) => (
                  <Link
                    key={membership.id}
                    href={`/associations/${membership.associationId}`}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-purple-500 dark:hover:border-purple-400 transition"
                  >
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {membership.association.user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {membership.role || "member"}
                      </p>
                    </div>
                    <span className="text-lg">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-pink-100 dark:border-pink-900/40">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              📅 Prochains événements
            </h2>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                Aucun événement à venir pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((registration) => (
                  <div
                    key={registration.id}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl"
                  >
                    <p className="font-bold text-gray-900 dark:text-white">
                      {registration.event.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(
                        registration.event.startDate
                      ).toLocaleDateString("fr-FR")}{" "}
                      • {registration.event.association.user.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

