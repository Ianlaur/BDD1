import Link from "next/link";
import { auth } from "@/lib/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-purple-100 dark:border-purple-800 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
          <img src="/assets/loftlogo.png" alt="Loft Logo" className="h-10 w-auto" />
          <span className="text-xl font-black text-[#112a60] dark:text-white hidden sm:inline font-heading">
            Loft
          </span>
        </Link>
        
        <div className="flex gap-6 items-center">
          {session ? (
            <>
              <Link href="/dashboard" className="font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                Dashboard
              </Link>
              <Link href="/associations" className="font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                Associations
              </Link>
              <Link href="/events" className="font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                Events
              </Link>
              <Link href="/profile" className="font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
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
              <Link href="/auth/signin" className="font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
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
