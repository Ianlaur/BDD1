import Link from "next/link";
import { auth } from "@/lib/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          AssociationConnect
        </Link>
        
        <div className="flex gap-6 items-center">
          {session ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/associations" className="hover:text-blue-600">
                Associations
              </Link>
              <Link href="/events" className="hover:text-blue-600">
                Events
              </Link>
              <Link href="/profile" className="hover:text-blue-600">
                Profile
              </Link>
              <form action={async () => {
                "use server";
                const { signOut } = await import("@/lib/auth");
                await signOut();
              }}>
                <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-blue-600">
                Sign In
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
