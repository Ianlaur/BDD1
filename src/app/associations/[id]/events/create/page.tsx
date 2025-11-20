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

export default async function CreateEventPage({ params }: PageProps) {
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

  async function createEvent(formData: FormData) {
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
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const capacity = formData.get("capacity") as string;
    const status = formData.get("status") as string;

    await prisma.event.create({
      data: {
        title,
        description: description || null,
        location: location || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        capacity: capacity ? parseInt(capacity) : null,
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        associationId: id,
      },
    });

    redirect(`/events`);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-[#112a60] dark:text-white mb-2 font-heading">
              📅 Create New Event
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Schedule an event for {association.user.name}
            </p>
          </div>

          {/* Form */}
          <form action={createEvent} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                placeholder="Annual Tech Conference 2025"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition resize-none"
                placeholder="Tell attendees about your event, what to expect, and any special requirements..."
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                placeholder="Main Campus Auditorium, Room 101"
              />
            </div>

            {/* Date & Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                />
              </div>
            </div>

            {/* Capacity */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Maximum Capacity
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                placeholder="100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty for unlimited capacity
              </p>
            </div>

            {/* Publishing Options */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                Publishing Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-[#f67a19] transition">
                  <input
                    type="radio"
                    name="status"
                    value="PUBLISHED"
                    defaultChecked
                    className="w-5 h-5 text-[#f67a19] focus:ring-[#f67a19]"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">📢 Publish Now</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Event will be visible to all students immediately</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-[#a5dce2] transition">
                  <input
                    type="radio"
                    name="status"
                    value="DRAFT"
                    className="w-5 h-5 text-[#a5dce2] focus:ring-[#a5dce2]"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">📝 Save as Draft</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Keep private, publish later from manage page</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#f67a19] hover:bg-[#e56a09] text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                📅 Create Event
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
