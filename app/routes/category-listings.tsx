import { ListingsGrid } from '~/components/listings-grid';
import { Pagination } from '~/components/pagination';
import type { Route } from './+types/category-listings';
import { db } from '~/utils/db';
import { invariantResponse } from '~/utils/misc';
import { desc, eq } from 'drizzle-orm';
import { listings, listingToCategory } from 'drizzle/schema';

export async function loader({ params }: Route.LoaderArgs) {
  const categoryId = params.categoryId;
  const category = await db.query.categories.findFirst({
    where: (categories, { eq }) => eq(categories.id, +categoryId),
  });

  invariantResponse(category);

  const listingsInCategory = await db
    .select()
    .from(listings)
    .innerJoin(listingToCategory, eq(listings.id, listingToCategory.listingId))
    .where(eq(listingToCategory.categoryId, +categoryId))
    .orderBy(desc(listings.createdAt));

  return {
    listings: listingsInCategory.map((row) => row.listings),
    categoryName: category.name,
  };
}

export default function CategoryListings({ loaderData }: Route.ComponentProps) {
  const { categoryName, listings } = loaderData;
  if (listings.length === 0) {
    return (
      <p>
        No items found for category <b>{categoryName}</b>
      </p>
    );
  }

  return (
    <>
      <h1 className="title">{categoryName}</h1>
      <ListingsGrid listings={listings} />
      <div className="flex justify-center p-8">
        <Pagination />
      </div>
    </>
  );
}
