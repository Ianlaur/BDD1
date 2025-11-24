import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "./SignOutButton";
import { SidebarWrapper } from "./SidebarWrapper";

export async function Sidebar() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const isAssociation = session.user.role === "ASSOCIATION";
  const isAdmin = session.user.role === "ADMIN";

  // Get association profile if user is an association
  let associationProfile = null;
  if (isAssociation) {
    associationProfile = await prisma.associationProfile.findUnique({
      where: { userId: session.user.id },
    });
  }

  return (
    <SidebarWrapper>
      <aside id="sidebar" className="fixed left-0 top-0 h-screen w-64 bg-[#112a60] dark:bg-[#0a1a3a] border-r border-[#a5dce2]/20 shadow-2xl z-40 overflow-y-auto transition-transform duration-300 ease-in-out">
        {/* Logo Section */}
        <div className="p-6 border-b border-[#a5dce2]/20">
          <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
            <img src="/assets/loftlogo.png" alt="Loft Logo" className="h-10 w-auto" />
            <span className="text-lg font-black text-white font-heading">
              Loft
            </span>
          </Link>
        </div>

      {/* User Info */}
      <div className="p-4 border-b border-[#a5dce2]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f67a19] flex items-center justify-center text-white font-bold">
            {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-white truncate">
              {session.user.name}
            </div>
            <div className="text-xs text-[#a5dce2] truncate">
              {session.user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#f67a19] transition-all group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🏠</span>
          <span className="font-semibold">Dashboard</span>
        </Link>
        {!isAssociation && (
          <>
            <Link
              href="/associations"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#f67a19] transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">🎯</span>
              <span className="font-semibold">Associations</span>
            </Link>
            <Link
              href="/events"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#f67a19] transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">📅</span>
              <span className="font-semibold">Events</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#f67a19] transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
              <span className="font-semibold">Profile</span>
            </Link>
          </>
        )}

        {/* Association Management (for associations only) */}
        {isAssociation && associationProfile && (
          <>
            <div className="h-px bg-[#a5dce2]/20 my-3"></div>
            <Link
              href={`/associations/${associationProfile.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#a5dce2] hover:text-[#112a60] transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
              <span className="font-semibold">My Association</span>
            </Link>
            <Link
              href={`/associations/${associationProfile.id}/manage`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#a5dce2] hover:text-[#112a60] transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">⚙️</span>
              <span className="font-semibold">Manage</span>
            </Link>
            <Link
              href={`/associations/${associationProfile.id}/events/create`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#f67a19] transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
              <span className="font-semibold">Create Event</span>
            </Link>
            <div className="h-px bg-[#a5dce2]/20 my-3"></div>
            <Link
              href={`/associations/${associationProfile.id}/erp`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#a5dce2] hover:text-[#112a60] transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">🏢</span>
              <span className="font-semibold">ERP Dashboard</span>
            </Link>
            <Link
              href={`/associations/${associationProfile.id}/erp/team`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#a5dce2] hover:text-[#112a60] transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">👥</span>
              <span className="font-semibold">Team</span>
            </Link>
            <Link
              href={`/associations/${associationProfile.id}/erp/budget`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#a5dce2] hover:text-[#112a60] transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">💰</span>
              <span className="font-semibold">Budget</span>
            </Link>
            <Link
              href={`/associations/${associationProfile.id}/erp/projects`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#a5dce2] hover:text-[#112a60] transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">📋</span>
              <span className="font-semibold">Projects</span>
            </Link>
            <Link
              href={`/associations/${associationProfile.id}/erp/calendar`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#a5dce2] hover:text-[#112a60] transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">📆</span>
              <span className="font-semibold">Calendar</span>
            </Link>
          </>
        )}

        {/* Admin Section (for admins only) */}
        {isAdmin && (
          <>
            <div className="h-px bg-[#a5dce2]/20 my-3"></div>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[#f67a19] transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">🔧</span>
              <span className="font-semibold">Admin Panel</span>
            </Link>
          </>
        )}

        {/* Sign Out */}
        <div className="pt-4 border-t border-[#a5dce2]/20">
          <SignOutButton />
        </div>
      </nav>
    </aside>
    </SidebarWrapper>
  );
}
