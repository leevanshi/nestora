import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, MapPin, Home as HomeIcon, Building, Key } from "lucide-react";
import { useGetFeaturedListings, useGetRecentListings, useGetListingStats } from "@workspace/api-client-react";
import { ListingCard } from "@/components/listing/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("buy");

  const { data: featuredListings, isLoading: isFeaturedLoading } = useGetFeaturedListings();
  const { data: recentListings, isLoading: isRecentLoading } = useGetRecentListings({ limit: 4 });
  const { data: stats } = useGetListingStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/listings?search=${encodeURIComponent(searchQuery)}&status=${activeTab === 'buy' ? 'for_sale' : 'for_rent'}`);
    } else {
      setLocation(`/listings?status=${activeTab === 'buy' ? 'for_sale' : 'for_rent'}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center pt-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src="/hero-bg.jpg" 
            alt="Luxury home exterior" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container relative z-20 px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 drop-shadow-lg max-w-4xl mx-auto leading-tight">
            Discover a place you'll love to live
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md">
            Nestora offers the most premium and exclusive real estate listings in the country. Let us help you find your dream home.
          </p>
          
          <div className="max-w-3xl mx-auto bg-background rounded-xl p-2 shadow-2xl">
            <div className="flex gap-2 mb-2 px-2 pt-2">
              <Button 
                variant={activeTab === 'buy' ? 'default' : 'ghost'} 
                className={`flex-1 rounded-lg ${activeTab === 'buy' ? '' : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('buy')}
              >
                Buy
              </Button>
              <Button 
                variant={activeTab === 'rent' ? 'default' : 'ghost'} 
                className={`flex-1 rounded-lg ${activeTab === 'rent' ? '' : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('rent')}
              >
                Rent
              </Button>
            </div>
            
            <form onSubmit={handleSearch} className="flex items-center gap-2 p-2 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="City, Neighborhood, or Zip Code" 
                className="pl-12 h-14 text-lg border-0 shadow-none focus-visible:ring-0 rounded-lg bg-muted/30"
              />
              <Button type="submit" size="lg" className="h-14 px-8 text-lg rounded-lg">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-12 bg-primary text-primary-foreground border-y border-primary-foreground/10">
          <div className="container px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-primary-foreground/20">
              <div className="text-center px-4">
                <div className="text-3xl md:text-4xl font-bold mb-1">{stats.totalListings.toLocaleString()}</div>
                <div className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider">Total Listings</div>
              </div>
              <div className="text-center px-4">
                <div className="text-3xl md:text-4xl font-bold mb-1">
                  ${(stats.avgPrice / 1000).toFixed(0)}k
                </div>
                <div className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider">Avg. Price</div>
              </div>
              <div className="text-center px-4">
                <div className="text-3xl md:text-4xl font-bold mb-1">{stats.forSaleCount.toLocaleString()}</div>
                <div className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider">Homes For Sale</div>
              </div>
              <div className="text-center px-4">
                <div className="text-3xl md:text-4xl font-bold mb-1">{stats.forRentCount.toLocaleString()}</div>
                <div className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider">For Rent</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Listings */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Featured Properties</h2>
              <p className="text-muted-foreground text-lg">Handpicked selection of premium homes.</p>
            </div>
            <Link href="/listings?isFeatured=true">
              <Button variant="outline" className="hidden sm:flex">View All Featured</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[300px] md:auto-rows-[400px]">
            {isFeaturedLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className={`rounded-xl overflow-hidden ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                  <Skeleton className="w-full h-full" />
                </div>
              ))
            ) : featuredListings?.slice(0, 4).map((listing, i) => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                featured={i === 0} 
              />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/listings?isFeatured=true">
              <Button variant="outline" className="w-full">View All Featured</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Explore by Property Type</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find exactly what you're looking for by browsing our most popular categories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/listings?propertyType=house">
              <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <HomeIcon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Houses</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats?.byPropertyType.find(t => t.propertyType === 'house')?.count || 0} properties
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/listings?propertyType=condo">
              <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <Building className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Condos</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats?.byPropertyType.find(t => t.propertyType === 'condo')?.count || 0} properties
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/listings?propertyType=apartment">
              <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <Key className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Apartments</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats?.byPropertyType.find(t => t.propertyType === 'apartment')?.count || 0} properties
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/listings?propertyType=townhouse">
              <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Townhouses</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats?.byPropertyType.find(t => t.propertyType === 'townhouse')?.count || 0} properties
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Recently Added</h2>
              <p className="text-muted-foreground text-lg">The newest properties on the market.</p>
            </div>
            <Link href="/listings">
              <Button variant="outline" className="hidden sm:flex">Browse All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isRecentLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden h-[400px]">
                  <Skeleton className="w-full h-full" />
                </div>
              ))
            ) : recentListings?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/listings">
              <Button variant="outline" className="w-full">Browse All</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
