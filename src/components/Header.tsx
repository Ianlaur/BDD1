import Link from "next/link";
import { auth } from "@/lib/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-purple-100 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
          AssociationConnect
        </Link>
        
        <div className="flex gap-6 items-center">
          {session ? (
            <>
              <Link href="/dashboard" className="font-semibold text-gray-700 hover:text-purple-600 transition">
                Dashboard
              </Link>
              <Link href="/associations" className="font-semibold text-gray-700 hover:text-purple-600 transition">
                Associations
              </Link>
              <Link href="/events" className="font-semibold text-gray-700 hover:text-purple-600 transition">
                Events
              </Link>
              <Link href="/profile" className="font-semibold text-gray-700 hover:text-purple-600 transition">
                Profile
              </Link>
              <form action={async () => {
                "use server";
                const { signOut } = await import("@/lib/auth");
                await signOut();
              }}>
                <button className="px-5 py-2.5 bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all">
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="font-semibold text-gray-700 hover:text-purple-600 transition">
                Sign In
              </Link>
              <Link href="/auth/signup" className="px-6 py-2.5 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
