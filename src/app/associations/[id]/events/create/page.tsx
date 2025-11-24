import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { EventForm } from "@/components/EventForm";

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
          <EventForm associationId={id} associationName={association.user.name || ''} />
        </div>
      </div>
    </div>
  );
}
