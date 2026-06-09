import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 mt-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <span className="font-serif text-3xl font-bold tracking-tighter text-primary">
            IBN
          </span>
          <p className="mt-4 text-sm text-gray-400 max-w-xs">
            The world's most trusted digital news network. Breaking news, deep analysis, and global perspectives.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Sections</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/category/world" className="hover:text-white transition">World</Link></li>
            <li><Link href="/category/tech" className="hover:text-white transition">Tech</Link></li>
            <li><Link href="/category/business" className="hover:text-white transition">Business</Link></li>
            <li><Link href="/category/sports" className="hover:text-white transition">Sports</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">About</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition">About Us</a></li>
            <li><a href="#" className="hover:text-white transition">Careers</a></li>
            <li><a href="#" className="hover:text-white transition">Press</a></li>
            <li><a href="#" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Cookie Settings</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
        <p>© {new Date().getFullYear()} IBN News Network. All rights reserved.</p>
      </div>
    </footer>
  );
}
