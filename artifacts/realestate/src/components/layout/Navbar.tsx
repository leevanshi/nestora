import { Link } from "wouter";
import { useLocation } from "wouter";
import { Home, Heart, PlusCircle, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/listings", label: "Browse" },
    { href: "/saved", label: "Saved" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Home className="h-5 w-5" />
          </div>
          <span className="text-xl font-serif font-bold tracking-tight">Nestora</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-muted-foreground"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/saved" className="text-muted-foreground hover:text-primary transition-colors">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href="/submit">
              <Button size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                List Property
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 py-4 space-y-4">
          <div className="flex flex-col space-y-3">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors ${location === link.href ? "text-primary" : "text-muted-foreground"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t flex flex-col gap-3">
            <Link href="/submit" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full gap-2">
                <PlusCircle className="h-4 w-4" />
                List Property
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
