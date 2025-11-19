import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get all published events
  const allEvents = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startDate: {
        gte: new Date(), // Only future events
      },
    },
    include: {
      association: {
        include: {
          user: true,
        },
      },
      registrations: {
        where: {
          userId: session.user.id,
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  // Get user's registered events
  const myEvents = await prisma.eventRegistration.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      event: {
        include: {
          association: {
            include: {
              user: true,
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      },
    },
    orderBy: {
      event: {
        startDate: "asc",
      },
    },
  });

  async function registerForEvent(formData: FormData) {
    "use server";
    
    const session = await auth();
    if (!session?.user) {
      redirect("/auth/signin");
    }

    const eventId = formData.get("eventId") as string;

    try {
      await prisma.eventRegistration.create({
        data: {
          userId: session.user.id,
          eventId,
          status: "registered",
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
    }

    redirect("/events");
  }

  async function unregisterFromEvent(formData: FormData) {
    "use server";
    
    const session = await auth();
    if (!session?.user) {
      redirect("/auth/signin");
    }

    const eventId = formData.get("eventId") as string;

    try {
      await prisma.eventRegistration.deleteMany({
        where: {
          userId: session.user.id,
          eventId,
        },
      });
    } catch (error) {
      console.error("Unregister error:", error);
    }

    redirect("/events");
  }

  const upcomingUserEvents = myEvents.filter(
    (reg) => new Date(reg.event.startDate) >= new Date()
  );

  // Check if user is an association
  const userAssociation = await prisma.associationProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-[#112a60] dark:text-white mb-3 font-heading">
              📅 Campus Events
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Discover and join events from associations across campus
            </p>
          </div>
          {userAssociation && (
            <Link
              href={`/associations/${userAssociation.id}/events/create`}
              className="px-6 py-3 bg-[#f67a19] hover:bg-[#e56a09] text-white rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              ➕ Create Event
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Events</div>
              <div className="text-3xl">🎉</div>
            </div>
            <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
              {allEvents.length}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">My Events</div>
              <div className="text-3xl">✅</div>
            </div>
            <div className="text-4xl font-black text-green-600 dark:text-green-400">
              {upcomingUserEvents.length}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Available</div>
              <div className="text-3xl">🔓</div>
            </div>
            <div className="text-4xl font-black text-purple-600 dark:text-purple-400">
              {allEvents.filter((e) => e.registrations.length === 0).length}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* All Events */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-6">
                🎯 Upcoming Events
              </h2>

              {allEvents.length > 0 ? (
                <div className="space-y-4">
                  {allEvents.map((event) => {
                    const isRegistered = event.registrations.length > 0;
                    const isFull = event.capacity && event._count.registrations >= event.capacity;
                    const spotsLeft = event.capacity ? event.capacity - event._count.registrations : null;

                    return (
                      <div
                        key={event.id}
                        className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-lg transition group"
                      >
                        {/* Event Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                              {event.title}
                            </h3>
                            <Link
                              href={`/associations/${event.associationId}`}
                              className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold"
                            >
                              <span className="w-6 h-6 rounded bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs">
                                {event.association.user.name?.charAt(0) || "A"}
                              </span>
                              {event.association.user.name}
                            </Link>
                          </div>

                          {/* Status Badges */}
                          <div className="flex flex-col gap-2 items-end">
                            {isRegistered && (
                              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                                ✅ Registered
                              </span>
                            )}
                            {isFull && !isRegistered && (
                              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-xs font-bold">
                                🚫 Full
                              </span>
                            )}
                            {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && !isRegistered && (
                              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full text-xs font-bold">
                                ⚠️ {spotsLeft} spots left
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-bold">📅</span>
                            <span>{new Date(event.startDate).toLocaleDateString("en-US", { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-bold">🕐</span>
                            <span>{new Date(event.startDate).toLocaleTimeString("en-US", { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-bold">📍</span>
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-bold">👥</span>
                            <span>
                              {event._count.registrations} registered
                              {event.capacity && ` / ${event.capacity} capacity`}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {event.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        {/* Action Button */}
                        {isRegistered ? (
                          <form action={unregisterFromEvent}>
                            <input type="hidden" name="eventId" value={event.id} />
                            <button
                              type="submit"
                              className="w-full px-4 py-2 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            >
                              Cancel Registration
                            </button>
                          </form>
                        ) : isFull ? (
                          <button
                            disabled
                            className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-bold cursor-not-allowed"
                          >
                            Event Full
                          </button>
                        ) : (
                          <form action={registerForEvent}>
                            <input type="hidden" name="eventId" value={event.id} />
                            <button
                              type="submit"
                              className="w-full px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                            >
                              Register for Event 🎉
                            </button>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-8xl mb-4">📅</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    No Upcoming Events
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check back later for new events!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - My Registrations */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sticky top-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">
                ✅ My Registrations
              </h2>

              {upcomingUserEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingUserEvents.map((registration) => (
                    <div
                      key={registration.id}
                      className="p-4 border-2 border-green-200 dark:border-green-800 rounded-xl bg-green-50 dark:bg-green-900/10"
                    >
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {registration.event.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {new Date(registration.event.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                        {registration.event.association.user.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-3">🎯</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You haven't registered for any events yet
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/associations"
                    className="block p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition text-center font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Browse Associations
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-center font-semibold text-gray-700 dark:text-gray-300"
                  >
                    My Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
