import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, listingsTable, savedListingsTable } from "@workspace/db";
import {
  SaveListingBody,
  UnsaveListingParams,
  GetSavedListingsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/saved-listings", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: savedListingsTable.id,
      listingId: savedListingsTable.listingId,
      createdAt: savedListingsTable.createdAt,
      listing: listingsTable,
    })
    .from(savedListingsTable)
    .innerJoin(listingsTable, eq(savedListingsTable.listingId, listingsTable.id))
    .orderBy(savedListingsTable.createdAt);

  const serialized = rows.map((row) => ({
    id: row.id,
    listingId: row.listingId,
    createdAt: row.createdAt.toISOString(),
    listing: {
      ...row.listing,
      bathrooms: Number(row.listing.bathrooms),
      createdAt: row.listing.createdAt.toISOString(),
      updatedAt: row.listing.updatedAt?.toISOString() ?? null,
      description: row.listing.description ?? null,
      yearBuilt: row.listing.yearBuilt ?? null,
      parkingSpots: row.listing.parkingSpots ?? null,
    },
  }));

  res.json(GetSavedListingsResponse.parse(serialized));
});

router.post("/saved-listings", async (req, res): Promise<void> => {
  const parsed = SaveListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, parsed.data.listingId));

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const [saved] = await db
    .insert(savedListingsTable)
    .values({ listingId: parsed.data.listingId })
    .returning();

  res.status(201).json({
    id: saved.id,
    listingId: saved.listingId,
    createdAt: saved.createdAt.toISOString(),
    listing: {
      ...listing,
      bathrooms: Number(listing.bathrooms),
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt?.toISOString() ?? null,
      description: listing.description ?? null,
      yearBuilt: listing.yearBuilt ?? null,
      parkingSpots: listing.parkingSpots ?? null,
    },
  });
});

router.delete("/saved-listings/:id", async (req, res): Promise<void> => {
  const params = UnsaveListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db
    .delete(savedListingsTable)
    .where(eq(savedListingsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
