import { Link } from "wouter";
import { Heart, Bed, Bath, Square, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Listing, SavedListing } from "@workspace/api-client-react";
import { useSaveListing, useUnsaveListing, useGetSavedListings, getGetSavedListingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

interface ListingCardProps {
  listing: Listing;
  featured?: boolean;
}

export function ListingCard({ listing, featured = false }: ListingCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: savedListings } = useGetSavedListings();
  const saveListing = useSaveListing();
  const unsaveListing = useUnsaveListing();

  const isSaved = useMemo(() => {
    return savedListings?.some(sl => sl.listingId === listing.id) || false;
  }, [savedListings, listing.id]);

  const savedListingId = useMemo(() => {
    return savedListings?.find(sl => sl.listingId === listing.id)?.id;
  }, [savedListings, listing.id]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSaved && savedListingId) {
      unsaveListing.mutate(
        { id: savedListingId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetSavedListingsQueryKey() });
            toast({ title: "Removed from saved listings" });
          },
          onError: () => {
            toast({ title: "Error removing listing", variant: "destructive" });
          }
        }
      );
    } else {
      saveListing.mutate(
        { data: { listingId: listing.id } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetSavedListingsQueryKey() });
            toast({ title: "Saved to your listings" });
          },
          onError: () => {
            toast({ title: "Error saving listing", variant: "destructive" });
          }
        }
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const statusDisplay = {
    for_sale: "For Sale",
    for_rent: "For Rent",
    sold: "Sold"
  };

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer h-full flex flex-col border-muted ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={listing.images?.[0] || `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200`} 
            alt={listing.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary" className="font-semibold bg-white/90 text-foreground hover:bg-white">
              {statusDisplay[listing.status as keyof typeof statusDisplay] || listing.status}
            </Badge>
            {listing.isFeatured && (
              <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Featured
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`absolute top-4 right-4 rounded-full h-8 w-8 bg-white/50 backdrop-blur hover:bg-white ${isSaved ? 'text-destructive' : 'text-foreground'}`}
            onClick={handleToggleSave}
            data-testid={`btn-save-listing-${listing.id}`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        <CardContent className="p-5 flex-grow">
          <div className="text-2xl font-bold text-primary mb-2">
            {formatPrice(listing.price)}
            {listing.status === 'for_rent' && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
          </div>
          
          <h3 className="font-serif text-lg font-semibold line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          
          <div className="flex items-center text-muted-foreground text-sm mb-4 line-clamp-1">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            {listing.address}, {listing.city}, {listing.state} {listing.zip}
          </div>
        </CardContent>
        
        <CardFooter className="p-5 pt-0 mt-auto">
          <div className="flex items-center justify-between w-full text-sm border-t pt-4">
            <div className="flex items-center gap-1.5 font-medium">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span>{listing.bedrooms} <span className="hidden sm:inline-block text-muted-foreground font-normal">Beds</span></span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span>{listing.bathrooms} <span className="hidden sm:inline-block text-muted-foreground font-normal">Baths</span></span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Square className="h-4 w-4 text-muted-foreground" />
              <span>{listing.sqft.toLocaleString()} <span className="hidden sm:inline-block text-muted-foreground font-normal">Sq Ft</span></span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
