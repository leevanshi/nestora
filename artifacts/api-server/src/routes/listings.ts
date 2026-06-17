import { Router, type IRouter } from "express";
import { eq, ilike, and, gte, lte, sql, desc } from "drizzle-orm";
import { db, listingsTable, savedListingsTable } from "@workspace/db";
import {
  GetListingsQueryParams,
  GetListingParams,
  UpdateListingParams,
  UpdateListingBody,
  DeleteListingParams,
  CreateListingBody,
  GetListingsResponse,
  GetListingResponse,
  UpdateListingResponse,
  GetListingStatsResponse,
  GetFeaturedListingsResponse,
  GetRecentListingsQueryParams,
  GetRecentListingsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/listings/stats", async (_req, res): Promise<void> => {
  const listings = await db.select().from(listingsTable);

  const totalListings = listings.length;
  const avgPrice =
    totalListings > 0
      ? Math.round(listings.reduce((sum, l) => sum + l.price, 0) / totalListings)
      : 0;
  const forSaleCount = listings.filter((l) => l.status === "for_sale").length;
  const forRentCount = listings.filter((l) => l.status === "for_rent").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;

  const typeMap: Record<string, number> = {};
  for (const l of listings) {
    typeMap[l.propertyType] = (typeMap[l.propertyType] ?? 0) + 1;
  }
  const byPropertyType = Object.entries(typeMap).map(([propertyType, count]) => ({
    propertyType,
    count,
  }));

  res.json(
    GetListingStatsResponse.parse({
      totalListings,
      avgPrice,
      forSaleCount,
      forRentCount,
      soldCount,
      byPropertyType,
    })
  );
});

router.get("/listings/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.isFeatured, true))
    .orderBy(desc(listingsTable.createdAt))
    .limit(6);
  res.json(GetFeaturedListingsResponse.parse(rows.map(serializeListing)));
});

router.get("/listings/recent", async (req, res): Promise<void> => {
  const parsed = GetRecentListingsQueryParams.safeParse(req.query);
  const limit = parsed.success && parsed.data.limit ? parsed.data.limit : 8;
  const rows = await db
    .select()
    .from(listingsTable)
    .orderBy(desc(listingsTable.createdAt))
    .limit(limit);
  res.json(GetRecentListingsResponse.parse(rows.map(serializeListing)));
});

router.get("/listings", async (req, res): Promise<void> => {
  const parsed = GetListingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, minPrice, maxPrice, minBedrooms, propertyType, status, city } =
    parsed.data;

  const conditions = [];
  if (search) {
    conditions.push(
      sql`(${ilike(listingsTable.title, `%${search}%`)} OR ${ilike(listingsTable.address, `%${search}%`)} OR ${ilike(listingsTable.city, `%${search}%`)})`
    );
  }
  if (minPrice != null) conditions.push(gte(listingsTable.price, minPrice));
  if (maxPrice != null) conditions.push(lte(listingsTable.price, maxPrice));
  if (minBedrooms != null) conditions.push(gte(listingsTable.bedrooms, minBedrooms));
  if (propertyType) conditions.push(eq(listingsTable.propertyType, propertyType));
  if (status) conditions.push(eq(listingsTable.status, status));
  if (city) conditions.push(ilike(listingsTable.city, `%${city}%`));

  const rows = await db
    .select()
    .from(listingsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(listingsTable.createdAt));

  res.json(GetListingsResponse.parse(rows.map(serializeListing)));
});

router.post("/listings", async (req, res): Promise<void> => {
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(listingsTable)
    .values({
      ...parsed.data,
      bathrooms: String(parsed.data.bathrooms),
      images: parsed.data.images ?? [],
      features: parsed.data.features ?? [],
      isFeatured: parsed.data.isFeatured ?? false,
    })
    .returning();
  res.status(201).json(GetListingResponse.parse(serializeListing(row)));
});

router.get("/listings/:id", async (req, res): Promise<void> => {
  const params = GetListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  res.json(GetListingResponse.parse(serializeListing(row)));
});

router.patch("/listings/:id", async (req, res): Promise<void> => {
  const params = UpdateListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.bathrooms != null) {
    updateData.bathrooms = String(parsed.data.bathrooms);
  }
  const [row] = await db
    .update(listingsTable)
    .set(updateData)
    .where(eq(listingsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  res.json(UpdateListingResponse.parse(serializeListing(row)));
});

router.delete("/listings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(listingsTable).where(eq(listingsTable.id, id));
  res.sendStatus(204);
});

function serializeListing(row: typeof listingsTable.$inferSelect) {
  return {
    ...row,
    bathrooms: Number(row.bathrooms),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
    description: row.description ?? null,
    yearBuilt: row.yearBuilt ?? null,
    parkingSpots: row.parkingSpots ?? null,
  };
}

export default router;
