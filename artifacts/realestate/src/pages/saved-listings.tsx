import { useGetSavedListings } from "@workspace/api-client-react";
import { ListingCard } from "@/components/listing/ListingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Heart } from "lucide-react";

export default function SavedListings() {
  const { data: savedListings, isLoading } = useGetSavedListings();

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <div className="bg-background border-b mb-8">
        <div className="container px-4 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Saved Homes</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Keep track of your favorite properties and revisit them anytime.
          </p>
        </div>
      </div>

      <div className="container px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden h-[400px]">
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        ) : savedListings && savedListings.length > 0 ? (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">{savedListings.length} Properties Saved</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedListings.map((saved) => (
                <ListingCard key={saved.id} listing={saved.listing} />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-24 text-center bg-background rounded-2xl border border-dashed max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3">No saved properties yet</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              When you find a home you love, click the heart icon to save it here for later.
            </p>
            <Link href="/listings">
              <Button size="lg" className="h-12 px-8">Browse Listings</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
