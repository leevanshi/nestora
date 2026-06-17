import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetListings } from "@workspace/api-client-react";
import { ListingCard } from "@/components/listing/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";

export default function Listings() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  // Parse query params into state
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minBedrooms, setMinBedrooms] = useState(searchParams.get("minBedrooms") || "any");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "any");
  const [status, setStatus] = useState(searchParams.get("status") || "any");

  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Sync state to activeFilters for API
  useEffect(() => {
    const filters: Record<string, string> = {};
    if (search) filters.search = search;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (minBedrooms && minBedrooms !== "any") filters.minBedrooms = minBedrooms;
    if (propertyType && propertyType !== "any") filters.propertyType = propertyType;
    if (status && status !== "any") filters.status = status;
    setActiveFilters(filters);
  }, [search, minPrice, maxPrice, minBedrooms, propertyType, status]);

  const { data: listings, isLoading } = useGetListings({
    search: activeFilters.search,
    minPrice: activeFilters.minPrice ? parseInt(activeFilters.minPrice) : undefined,
    maxPrice: activeFilters.maxPrice ? parseInt(activeFilters.maxPrice) : undefined,
    minBedrooms: activeFilters.minBedrooms ? parseInt(activeFilters.minBedrooms) : undefined,
    propertyType: activeFilters.propertyType,
    status: activeFilters.status,
  });

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(activeFilters).forEach(([key, value]) => {
      params.append(key, value);
    });
    setLocation(`/listings?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setMinBedrooms("any");
    setPropertyType("any");
    setStatus("any");
    setLocation("/listings");
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="City, neighborhood..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Any Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Status</SelectItem>
            <SelectItem value="for_sale">For Sale</SelectItem>
            <SelectItem value="for_rent">For Rent</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Property Type</Label>
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger>
            <SelectValue placeholder="Any Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Type</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="condo">Condo</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="townhouse">Townhouse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Min Price</Label>
          <Input 
            type="number" 
            placeholder="No Min" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Max Price</Label>
          <Input 
            type="number" 
            placeholder="No Max" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Bedrooms</Label>
        <Select value={minBedrooms} onValueChange={setMinBedrooms}>
          <SelectTrigger>
            <SelectValue placeholder="Any Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="5">5+</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* Search Header */}
      <div className="bg-background border-b sticky top-16 z-40">
        <div className="container px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md hidden md:flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search location..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              />
            </div>
            <Button onClick={handleApplyFilters}>Search</Button>
          </div>
          
          <div className="flex-1 md:hidden">
            <h1 className="font-serif text-xl font-bold">Browse Listings</h1>
          </div>

          <div className="flex items-center gap-2">
            {Object.keys(activeFilters).length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="hidden sm:flex text-muted-foreground">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {Object.keys(activeFilters).length > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                      {Object.keys(activeFilters).length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
                <SheetHeader>
                  <SheetTitle>Filter Properties</SheetTitle>
                </SheetHeader>
                <div className="py-6 flex-1 overflow-y-auto">
                  <FiltersContent />
                </div>
                <SheetFooter className="pt-6 border-t mt-auto gap-2 sm:space-x-0 sm:gap-2 flex-col sm:flex-row">
                  <Button variant="outline" onClick={handleResetFilters} className="w-full">
                    Reset
                  </Button>
                  <SheetClose asChild>
                    <Button onClick={handleApplyFilters} className="w-full">
                      Apply Filters
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {isLoading ? "Searching..." : `${listings?.length || 0} Homes Available`}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden h-[400px]">
                <Skeleton className="w-full h-full" />
              </div>
            ))
          ) : listings && listings.length > 0 ? (
            listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-background rounded-xl border border-dashed">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search criteria.
              </p>
              <Button onClick={handleResetFilters} variant="outline">Clear all filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
