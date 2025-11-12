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
              <li><a href="/associations" className="hover:text-blue-600">Browse Associations</a></li>
              <li><a href="/events" className="hover:text-blue-600">Events</a></li>
              <li><a href="/about" className="hover:text-blue-600">About Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/support" className="hover:text-blue-600">Support</a></li>
              <li><a href="/privacy" className="hover:text-blue-600">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-blue-600">Terms of Service</a></li>
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
