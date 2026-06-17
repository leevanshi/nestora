import { Link } from "wouter";
import { Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Home className="h-4 w-4" />
              </div>
              <span className="text-lg font-serif font-bold tracking-tight">Nestora</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A premium real estate portal for finding your next perfect home. Distinctive, data-rich, and beautifully designed.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/listings" className="hover:text-primary transition-colors">All Properties</Link></li>
              <li><Link href="/listings?status=for_sale" className="hover:text-primary transition-colors">Homes for Sale</Link></li>
              <li><Link href="/listings?status=for_rent" className="hover:text-primary transition-colors">Apartments for Rent</Link></li>
              <li><Link href="/saved" className="hover:text-primary transition-colors">Saved Homes</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Services</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/submit" className="hover:text-primary transition-colors">List a Property</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Agent Finder</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mortgage Calculator</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Home Valuation</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Support</li>
              <li>hello@nestora.example.com</li>
              <li>1-800-NESTORA</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Nestora Real Estate. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
