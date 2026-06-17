import { useRoute, useLocation } from "wouter";
import { useGetListing, useGetSavedListings, useSaveListing, useUnsaveListing, useDeleteListing, getGetSavedListingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Bed, Bath, Square, MapPin, Heart, Share, Calendar, Car, Check, ChevronLeft, ChevronRight, Trash2, Edit } from "lucide-react";
import { useState, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ListingDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/listings/:id");
  const id = parseInt(params?.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: listing, isLoading, isError } = useGetListing(id, {
    query: { enabled: !!id }
  });

  const { data: savedListings } = useGetSavedListings();
  const saveListing = useSaveListing();
  const unsaveListing = useUnsaveListing();
  const deleteListing = useDeleteListing();

  const isSaved = useMemo(() => {
    return savedListings?.some(sl => sl.listingId === id) || false;
  }, [savedListings, id]);

  const savedListingId = useMemo(() => {
    return savedListings?.find(sl => sl.listingId === id)?.id;
  }, [savedListings, id]);

  const handleToggleSave = () => {
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
        { data: { listingId: id } },
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied to clipboard!" });
  };

  const handleDelete = () => {
    deleteListing.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Listing deleted" });
          setLocation("/listings");
        },
        onError: () => {
          toast({ title: "Error deleting listing", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 space-y-8 animate-pulse">
        <Skeleton className="h-10 w-3/4 max-w-2xl" />
        <Skeleton className="h-[60vh] w-full rounded-2xl" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
          <div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="container px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
        <p className="text-muted-foreground">The listing you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

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

  const images = listing.images?.length ? listing.images : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200"];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary" className="font-semibold bg-primary text-primary-foreground text-sm px-3 py-1">
                {statusDisplay[listing.status as keyof typeof statusDisplay] || listing.status}
              </Badge>
              {listing.isFeatured && (
                <Badge variant="outline" className="text-secondary border-secondary bg-secondary/10">Featured</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-2">
              {listing.title}
            </h1>
            <div className="flex items-center text-muted-foreground text-lg">
              <MapPin className="h-5 w-5 mr-1" />
              {listing.address}, {listing.city}, {listing.state} {listing.zip}
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end">
            <div className="text-4xl font-bold text-primary mb-4">
              {formatPrice(listing.price)}
              {listing.status === 'for_rent' && <span className="text-xl font-normal text-muted-foreground">/mo</span>}
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
              <Button 
                variant="outline" 
                size="lg" 
                className={`flex-1 md:flex-none gap-2 ${isSaved ? 'text-destructive border-destructive/50 bg-destructive/10' : ''}`}
                onClick={handleToggleSave}
              >
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" size="lg" className="flex-1 md:flex-none gap-2" onClick={handleShare}>
                <Share className="h-5 w-5" />
                Share
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="lg" className="flex-1 md:flex-none gap-2">
                    <Trash2 className="h-5 w-5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this property listing. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="relative rounded-2xl overflow-hidden mb-12 bg-muted h-[40vh] md:h-[60vh] group">
          <img 
            src={images[currentImageIndex]} 
            alt={`${listing.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {images.length > 1 && (
            <>
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 rounded-full bg-black/30 backdrop-blur-sm">
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-2 w-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Main Info */}
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Key Specs */}
            <div className="flex flex-wrap gap-x-12 gap-y-6 py-6 border-y">
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1 text-sm uppercase tracking-wide font-semibold">Bedrooms</span>
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Bed className="h-6 w-6 text-primary" />
                  {listing.bedrooms}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1 text-sm uppercase tracking-wide font-semibold">Bathrooms</span>
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Bath className="h-6 w-6 text-primary" />
                  {listing.bathrooms}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1 text-sm uppercase tracking-wide font-semibold">Square Feet</span>
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Square className="h-6 w-6 text-primary" />
                  {listing.sqft.toLocaleString()}
                </div>
              </div>
              {listing.yearBuilt && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1 text-sm uppercase tracking-wide font-semibold">Year Built</span>
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <Calendar className="h-6 w-6 text-primary" />
                    {listing.yearBuilt}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4 font-serif">About this property</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                {listing.description ? (
                  listing.description.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))
                ) : (
                  <p>No description provided for this property.</p>
                )}
              </div>
            </div>

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 font-serif">Features & Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="bg-primary/10 p-1.5 rounded-full text-primary">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-lg">{feature}</span>
                    </div>
                  ))}
                  {listing.parkingSpots !== null && listing.parkingSpots !== undefined && (
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-1.5 rounded-full text-primary">
                        <Car className="h-4 w-4" />
                      </div>
                      <span className="text-lg">{listing.parkingSpots} Parking Spots</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-24 border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Contact Agent</h3>
                <div className="space-y-4">
                  <Button className="w-full h-12 text-lg">Request Tour</Button>
                  <Button variant="outline" className="w-full h-12 text-lg">Send Message</Button>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Property Type</span>
                    <span className="font-semibold capitalize">{listing.propertyType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold">{statusDisplay[listing.status as keyof typeof statusDisplay] || listing.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Days on Nestora</span>
                    <span className="font-semibold">
                      {Math.max(1, Math.floor((new Date().getTime() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24)))} days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
