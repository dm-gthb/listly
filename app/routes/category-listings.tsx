import { ListingsGrid } from '~/components/listings-grid';
import { Pagination } from '~/components/pagination';
import type { Route } from './+types/category-listings';
import { db } from '~/utils/db';
import { invariantResponse } from '~/utils/misc';
import { desc, eq, sql } from 'drizzle-orm';
import { listings, listingToCategory } from 'drizzle/schema';
import { useSearchParams } from 'react-router';

const LISTINGS_PER_PAGE = 8;

export async function loader({ params, request }: Route.LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get('page') ?? 1);
  const categoryId = params.categoryId;
  const category = await db.query.categories.findFirst({
    where: (categories, { eq }) => eq(categories.id, +categoryId),
  });

  invariantResponse(category);

  const [countResult, listingsInCategory] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(listings)
      .innerJoin(listingToCategory, eq(listings.id, listingToCategory.listingId))
      .where(eq(listingToCategory.categoryId, +categoryId)),
    db
      .select()
      .from(listings)
      .innerJoin(listingToCategory, eq(listings.id, listingToCategory.listingId))
      .where(eq(listingToCategory.categoryId, +categoryId))
      .orderBy(desc(listings.createdAt))
      .limit(LISTINGS_PER_PAGE)
      .offset((page - 1) * LISTINGS_PER_PAGE),
  ]);

  return {
    count: countResult[0]?.count ?? 0,
    listings: listingsInCategory.map((row) => row.listings),
    categoryName: category.name,
  };
}

export default function CategoryListings({ loaderData }: Route.ComponentProps) {
  const { count, categoryName, listings } = loaderData;
  const [searchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') ?? 1);
  const pagesCount = Math.ceil(count / LISTINGS_PER_PAGE);

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
        {pagesCount > 1 && (
          <Pagination allPagesCount={pagesCount} currentPage={currentPage} />
        )}
      </div>
    </>
  );
}
