import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">AssociationConnect</h3>
            <p className="text-gray-600">
              Connecting students with clubs and associations.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="/associations" className="hover:text-blue-600">Browse Associations</Link></li>
              <li><Link href="/events" className="hover:text-blue-600">Events</Link></li>
              <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="/support" className="hover:text-blue-600">Support</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} AssociationConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
