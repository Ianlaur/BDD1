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

export default async function CreatePostPage({ params }: PageProps) {
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

  async function createPost(formData: FormData) {
    "use server";
    
    const session = await auth();
    if (!session?.user) {
      redirect("/auth/signin");
    }

    const assoc = await prisma.associationProfile.findUnique({
      where: { id },
    });

    if (!assoc || session.user.id !== assoc.userId) {
      redirect(`/associations/${id}`);
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const published = formData.get("published") === "true";

    await prisma.post.create({
      data: {
        title,
        content,
        published,
        associationId: id,
      },
    });

    redirect(`/associations/${id}/manage`);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text mb-2">
              📝 Create New Post
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share an update or announcement for {association.user.name}
            </p>
          </div>

          {/* Form */}
          <form action={createPost} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
            {/* Post Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Post Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                placeholder="Exciting News: New Workshop Series!"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={12}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition resize-none"
                placeholder="Write your post content here. Share updates, announcements, or important information with your members..."
              />
            </div>

            {/* Publish Status */}
            <div>
              <label htmlFor="published" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Publishing Status *
              </label>
              <select
                id="published"
                name="published"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
              >
                <option value="false">Save as Draft</option>
                <option value="true">Publish Now</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Published posts will be visible to all users immediately
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-linear-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
              >
                📝 Create Post
              </button>
              <a
                href={`/associations/${id}/manage`}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
