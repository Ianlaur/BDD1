import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

// Server action to update event
async function updateEvent(formData: FormData) {
  "use server";

  const eventId = formData.get("eventId") as string;
  const associationId = formData.get("associationId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const capacity = formData.get("capacity") as string;
  const status = formData.get("status") as string;

  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Verify ownership
  const association = await prisma.associationProfile.findUnique({
    where: { id: associationId },
  });

  if (!association || association.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Update the event
  await prisma.event.update({
    where: { id: eventId },
    data: {
      title,
      description: description || null,
      location: location || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      capacity: capacity ? parseInt(capacity) : null,
      status: status as "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED",
    },
  });

  revalidatePath(`/associations/${associationId}/manage`);
  revalidatePath("/events");
  redirect(`/associations/${associationId}/manage`);
}

export default async function EditEventPage({ params }: PageProps) {
  const session = await auth();
  const { id, eventId } = await params;

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Verify ownership
  const association = await prisma.associationProfile.findUnique({
    where: { id },
  });

  if (!association || association.userId !== session.user.id) {
    redirect(`/associations/${id}`);
  }

  // Fetch the event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.associationId !== id) {
    redirect(`/associations/${id}/manage`);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#112a60] dark:text-white mb-2 font-heading">
            ✏️ Edit Event
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your event details and publish when ready
          </p>
        </div>

        {/* Form */}
        <form action={updateEvent} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
          <input type="hidden" name="eventId" value={event.id} />
          <input type="hidden" name="associationId" value={id} />

          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={event.title}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-[#f67a19] focus:ring-2 focus:ring-[#f67a19]/20 transition bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="e.g., Annual Tech Conference 2024"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={event.description || ""}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-[#f67a19] focus:ring-2 focus:ring-[#f67a19]/20 transition bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="Describe what this event is about..."
            />
          </div>

          {/* Location */}
          <div className="mb-6">
            <label htmlFor="location" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={event.location || ""}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-[#f67a19] focus:ring-2 focus:ring-[#f67a19]/20 transition bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="e.g., Main Auditorium, Building A"
            />
          </div>

          {/* Date Range */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                defaultValue={new Date(event.startDate).toISOString().slice(0, 16)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-[#f67a19] focus:ring-2 focus:ring-[#f67a19]/20 transition bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                defaultValue={event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ""}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-[#f67a19] focus:ring-2 focus:ring-[#f67a19]/20 transition bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="mb-6">
            <label htmlFor="capacity" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
              Maximum Capacity
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              defaultValue={event.capacity || ""}
              min="1"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-[#f67a19] focus:ring-2 focus:ring-[#f67a19]/20 transition bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="e.g., 100"
            />
          </div>

          {/* Publishing Options */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">
              Event Status
            </label>
            <div className="space-y-3">
              {/* Publish Option */}
              <label className="flex items-start p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#f67a19] cursor-pointer transition-all group">
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  defaultChecked={event.status === "PUBLISHED"}
                  className="mt-1 mr-4 w-5 h-5 text-[#f67a19] focus:ring-[#f67a19]"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-[#f67a19] transition">
                    📢 Publish Now
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Make this event visible to everyone immediately
                  </p>
                </div>
              </label>

              {/* Draft Option */}
              <label className="flex items-start p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#a5dce2] cursor-pointer transition-all group">
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  defaultChecked={event.status === "DRAFT"}
                  className="mt-1 mr-4 w-5 h-5 text-[#a5dce2] focus:ring-[#a5dce2]"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-[#a5dce2] transition">
                    📝 Save as Draft
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Keep this event private, publish it later from your manage page
                  </p>
                </div>
              </label>

              {/* Cancelled Option */}
              <label className="flex items-start p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-500 cursor-pointer transition-all group">
                <input
                  type="radio"
                  name="status"
                  value="CANCELLED"
                  defaultChecked={event.status === "CANCELLED"}
                  className="mt-1 mr-4 w-5 h-5 text-red-500 focus:ring-red-500"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-red-500 transition">
                    ❌ Cancel Event
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mark this event as cancelled (will show as cancelled to users)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#f67a19] hover:bg-[#e56910] text-white font-bold rounded-xl transition hover:scale-105 shadow-md"
            >
              💾 Save Changes
            </button>
            <a
              href={`/associations/${id}/manage`}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-bold rounded-xl transition hover:scale-105 text-center"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
