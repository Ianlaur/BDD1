import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SettingsPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const association = await prisma.associationProfile.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });

  if (!association) {
    notFound();
  }

  // Check if user is admin of this association
  if (session.user.id !== association.userId) {
    redirect(`/associations/${id}`);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text mb-2">
              ⚙️ Association Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage settings and preferences for {association.user.name}
            </p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-4">
                🔧 General Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Basic settings and preferences for your association.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">Verification Status</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {association.verified ? "✅ Verified" : "⏳ Pending Verification"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-4">
                🔔 Notification Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Coming soon: Control how you receive notifications about membership requests, events, and more.
              </p>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-4">
                🔒 Privacy Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Coming soon: Manage who can see your association profile and contact information.
              </p>
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-red-200 dark:border-red-800">
              <h2 className="text-2xl font-black text-red-600 dark:text-red-400 mb-4">
                ⚠️ Danger Zone
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Irreversible actions that affect your association account.
              </p>
              <button
                disabled
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl opacity-50 cursor-not-allowed"
              >
                Delete Association (Coming Soon)
              </button>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <a
              href={`/associations/${id}/manage`}
              className="inline-block px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
