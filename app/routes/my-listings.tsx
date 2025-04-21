import { Link } from 'react-router';
import { ListingsGrid } from '~/components/listings-grid';
import { appRoute } from '~/routes';
import { db } from '~/utils/db';
import type { Route } from './+types/my-listings';

export async function loader() {
  const dummyUserListings = await db.query.listings.findMany({
    with: { categories: true },
    orderBy: (listings, { asc }) => [asc(listings.createdAt)],
    limit: 8,
  });
  return { dummyUserListings };
}

export default function MyListings({ loaderData }: Route.ComponentProps) {
  const { dummyUserListings } = loaderData;
  return (
    <div>
      <div className="flex justify-center">
        <Link
          to={appRoute.createListing}
          className="mb-8 rounded-4xl border-2 border-gray-300 px-8 py-4 shadow-md"
        >
          + create new
        </Link>
      </div>
      <ListingsGrid listings={dummyUserListings} isEdit />
    </div>
  );
}
