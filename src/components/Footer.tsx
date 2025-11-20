import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-purple-100 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-black text-xl mb-4 text-[#112a60] font-heading">
              Loft
            </h3>
            <p className="text-gray-600 leading-relaxed">
              🎓 Connecting students with clubs and associations to build amazing communities.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900">Quick Links</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="/associations" className="hover:text-purple-600 transition font-medium">Browse Associations</Link></li>
              <li><Link href="/events" className="hover:text-purple-600 transition font-medium">Events</Link></li>
              <li><Link href="/about" className="hover:text-purple-600 transition font-medium">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900">Contact</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="/support" className="hover:text-purple-600 transition font-medium">Support</Link></li>
              <li><Link href="/privacy" className="hover:text-purple-600 transition font-medium">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-purple-600 transition font-medium">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-purple-100 text-center text-gray-600">
          <p className="font-medium">&copy; {new Date().getFullYear()} Loft. All rights reserved. Made with 💜</p>
        </div>
      </div>
    </footer>
  );
}
