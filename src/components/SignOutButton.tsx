"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => {
        signOut({ callbackUrl: "/" });
      }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-red-600 transition-all w-full group"
    >
      <span className="text-xl group-hover:scale-110 transition-transform">🚪</span>
      <span className="font-semibold">Sign Out</span>
    </button>
  );
}
