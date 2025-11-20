import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function createMeeting(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const associationId = formData.get("associationId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  const attendeesStr = formData.get("attendees") as string;
  const agenda = formData.get("agenda") as string;

  const association = await prisma.associationProfile.findUnique({
    where: { id: associationId },
  });

  if (association?.userId !== session.user.id) {
    return;
  }

  const attendees = attendeesStr
    ? attendeesStr.split(",").map((a) => a.trim())
    : [];

  await prisma.meeting.create({
    data: {
      associationId,
      title,
      description: description || null,
      location: location || null,
      startTime,
      endTime,
      attendees,
      agenda: agenda || null,
    },
  });

  revalidatePath(`/associations/${associationId}/erp/calendar`);
}

async function updateMeetingNotes(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const meetingId = formData.get("meetingId") as string;
  const associationId = formData.get("associationId") as string;
  const notes = formData.get("notes") as string;

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: { association: true },
  });

  if (meeting?.association.userId !== session.user.id) {
    return;
  }

  await prisma.meeting.update({
    where: { id: meetingId },
    data: { notes },
  });

  revalidatePath(`/associations/${associationId}/erp/calendar`);
}

async function deleteMeeting(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const meetingId = formData.get("meetingId") as string;
  const associationId = formData.get("associationId") as string;

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: { association: true },
  });

  if (meeting?.association.userId !== session.user.id) {
    return;
  }

  await prisma.meeting.delete({
    where: { id: meetingId },
  });

  revalidatePath(`/associations/${associationId}/erp/calendar`);
}

export default async function Calendar({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const { id } = await params;
  const { month: monthParam, year: yearParam } = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const currentDate = new Date();
  const selectedMonth = monthParam
    ? parseInt(monthParam)
    : currentDate.getMonth();
  const selectedYear = yearParam
    ? parseInt(yearParam)
    : currentDate.getFullYear();

  const association = await prisma.associationProfile.findUnique({
    where: { id },
    include: {
      user: true,
      meetings: {
        where: {
          startTime: {
            gte: new Date(selectedYear, selectedMonth, 1),
            lt: new Date(selectedYear, selectedMonth + 1, 1),
          },
        },
        orderBy: { startTime: "asc" },
      },
      events: {
        where: {
          startDate: {
            gte: new Date(selectedYear, selectedMonth, 1),
            lt: new Date(selectedYear, selectedMonth + 1, 1),
          },
          status: "PUBLISHED",
        },
        orderBy: { startDate: "asc" },
      },
    },
  });

  if (!association) {
    redirect("/associations");
  }

  if (association.userId !== session.user.id) {
    redirect(`/associations/${id}`);
  }

  const upcomingMeetings = await prisma.meeting.findMany({
    where: {
      associationId: id,
      startTime: { gte: new Date() },
    },
    take: 5,
    orderBy: { startTime: "asc" },
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Calendar calculation
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/associations/${id}/erp`}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              ← Back to ERP
            </Link>
          </div>
          <h1 className="text-5xl font-black bg-linear-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📅 Calendar
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage meetings and view scheduled events
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-orange-200 dark:border-orange-900">
            <div className="text-4xl font-black text-orange-600 dark:text-orange-400">
              {association.meetings.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Meetings This Month
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-900">
            <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
              {association.events.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Events This Month
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-purple-200 dark:border-purple-900">
            <div className="text-4xl font-black text-purple-600 dark:text-purple-400">
              {upcomingMeetings.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Upcoming Meetings
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Create Meeting Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-orange-600 dark:text-orange-400 mb-4">
                ➕ Schedule Meeting
              </h2>
              <form action={createMeeting} className="space-y-4">
                <input type="hidden" name="associationId" value={id} />

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g., Room 101, Zoom"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Attendees
                  </label>
                  <input
                    type="text"
                    name="attendees"
                    placeholder="Comma-separated names"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Agenda
                  </label>
                  <textarea
                    name="agenda"
                    rows={3}
                    placeholder="Meeting agenda..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-orange-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:scale-105 transition-all"
                >
                  Schedule Meeting
                </button>
              </form>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-purple-600 dark:text-purple-400 mb-4">
                🔜 Upcoming Meetings
              </h2>
              <div className="space-y-3">
                {upcomingMeetings.length > 0 ? (
                  upcomingMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-3 bg-purple-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {meeting.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {meeting.startTime.toLocaleString()}
                      </div>
                      {meeting.location && (
                        <div className="text-xs text-purple-600 dark:text-purple-400">
                          📍 {meeting.location}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No upcoming meetings
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Calendar Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Month Navigator */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <Link
                  href={`/associations/${id}/erp/calendar?month=${selectedMonth === 0 ? 11 : selectedMonth - 1}&year=${selectedMonth === 0 ? selectedYear - 1 : selectedYear}`}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
                >
                  ← Prev
                </Link>
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">
                  {monthNames[selectedMonth]} {selectedYear}
                </h2>
                <Link
                  href={`/associations/${id}/erp/calendar?month=${selectedMonth === 11 ? 0 : selectedMonth + 1}&year=${selectedMonth === 11 ? selectedYear + 1 : selectedYear}`}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
                >
                  Next →
                </Link>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center font-black text-gray-600 dark:text-gray-400 py-2"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayMeetings = association.meetings.filter(
                    (m) => new Date(m.startTime).getDate() === day
                  );
                  const dayEvents = association.events.filter(
                    (e) => new Date(e.startDate).getDate() === day
                  );

                  const isToday =
                    day === currentDate.getDate() &&
                    selectedMonth === currentDate.getMonth() &&
                    selectedYear === currentDate.getFullYear();

                  return (
                    <div
                      key={day}
                      className={`p-2 border rounded-lg min-h-20 ${
                        isToday
                          ? "bg-orange-100 dark:bg-orange-900 border-orange-500"
                          : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <div
                        className={`text-right font-bold mb-1 ${
                          isToday
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {day}
                      </div>
                      {dayMeetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="text-xs bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-200 px-1 py-0.5 rounded mb-1 truncate"
                          title={meeting.title}
                        >
                          🔔 {meeting.title}
                        </div>
                      ))}
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200 px-1 py-0.5 rounded mb-1 truncate"
                          title={event.title}
                        >
                          🎉 {event.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meeting Details */}
            {association.meetings.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-black text-orange-600 dark:text-orange-400 mb-4">
                  📋 Meetings This Month
                </h3>
                <div className="space-y-4">
                  {association.meetings.map((meeting) => (
                    <details
                      key={meeting.id}
                      className="bg-orange-50 dark:bg-gray-700 rounded-xl p-4 group"
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-black text-lg text-gray-900 dark:text-gray-100">
                              {meeting.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {meeting.startTime.toLocaleString()} -{" "}
                              {meeting.endTime.toLocaleTimeString()}
                            </p>
                            {meeting.location && (
                              <p className="text-sm text-orange-600 dark:text-orange-400">
                                📍 {meeting.location}
                              </p>
                            )}
                          </div>
                          <span className="text-2xl group-open:rotate-180 transition-transform">
                            ▼
                          </span>
                        </div>
                      </summary>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                        {meeting.description && (
                          <div>
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Description:
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                              {meeting.description}
                            </p>
                          </div>
                        )}

                        {meeting.attendees.length > 0 && (
                          <div>
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Attendees ({meeting.attendees.length}):
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {meeting.attendees.map((attendee, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs"
                                >
                                  {attendee}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {meeting.agenda && (
                          <div>
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Agenda:
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                              {meeting.agenda}
                            </p>
                          </div>
                        )}

                        <div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Meeting Notes:
                          </div>
                          <form action={updateMeetingNotes} className="space-y-2">
                            <input
                              type="hidden"
                              name="meetingId"
                              value={meeting.id}
                            />
                            <input
                              type="hidden"
                              name="associationId"
                              value={id}
                            />
                            <textarea
                              name="notes"
                              defaultValue={meeting.notes || ""}
                              rows={4}
                              placeholder="Add meeting notes..."
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="flex-1 bg-linear-to-r from-orange-600 to-pink-600 text-white font-semibold py-2 px-6 rounded-lg hover:scale-105 transition-all"
                              >
                                Save Notes
                              </button>
                              <button
                                type="submit"
                                formAction={deleteMeeting}
                                className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:scale-105 transition-all"
                              >
                                Delete Meeting
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Events This Month */}
            {association.events.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-4">
                  🎉 Events This Month
                </h3>
                <div className="space-y-3">
                  {association.events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/associations/${id}/events/${event.id}`}
                      className="block p-4 bg-blue-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-all"
                    >
                      <h4 className="font-black text-lg text-gray-900 dark:text-gray-100">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.startDate.toLocaleString()}
                      </p>
                      {event.location && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          📍 {event.location}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
