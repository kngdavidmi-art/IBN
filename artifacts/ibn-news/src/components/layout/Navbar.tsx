import { Link, useLocation } from "wouter";
import { Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const categories = [
  "World",
  "Tech",
  "Business",
  "Sports",
  "Entertainment",
  "Science",
  "Videos",
];

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchClick = () => {
    setLocation("/search");
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <span className="font-serif text-3xl font-bold tracking-tighter text-primary cursor-pointer">
              IBN
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <span className={`text-sm font-semibold transition-colors hover:text-primary cursor-pointer ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
                Home
              </span>
            </Link>
            {categories.map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`}>
                <span className={`text-sm font-semibold transition-colors hover:text-primary cursor-pointer ${location === `/category/${cat.toLowerCase()}` ? 'text-primary' : 'text-muted-foreground'}`}>
                  {cat}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={`hidden md:inline-flex ${location === '/search' ? 'text-primary' : ''}`}
            onClick={handleSearchClick}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
            <Link href="/login">Admin</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t py-4 px-4 flex flex-col gap-4 bg-background">
          <Link href="/">
            <span className="text-lg font-semibold cursor-pointer block" onClick={() => setIsOpen(false)}>Home</span>
          </Link>
          {categories.map((cat) => (
            <Link key={cat} href={`/category/${cat.toLowerCase()}`}>
              <span className="text-lg font-semibold cursor-pointer block" onClick={() => setIsOpen(false)}>
                {cat}
              </span>
            </Link>
          ))}
          <button
            onClick={handleSearchClick}
            className="flex items-center gap-2 text-lg font-semibold text-muted-foreground mt-2 text-left"
          >
            <Search className="h-4 w-4" /> Search
          </button>
          <Link href="/login">
            <span className="text-lg font-semibold cursor-pointer block text-muted-foreground mt-2" onClick={() => setIsOpen(false)}>Admin</span>
          </Link>
        </div>
      )}
    </header>
  );
}
