import { db } from '~/utils/db.server';
import type { Route } from './+types/search';
import { redirect } from 'react-router';
import { ListingsGrid } from '~/components/listings-grid';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');

  if (!q) {
    return redirect('/');
  }

  const listings = await db.query.listings.findMany({
    where: (listings, { like }) => like(listings.title, `%${q}%`),
  });

  return { q, listings };
}

export default function Search({ loaderData }: Route.ComponentProps) {
  const { q, listings } = loaderData;
  return (
    <>
      <h1 className="sr-only">Search Results</h1>
      <p className="mb-4 text-xl">
        {listings.length > 0 ? `Search results for: ` : `No results found for: `}
        <span className="font-semibold capitalize">"{q}"</span>
      </p>
      <ListingsGrid listings={listings} />
    </>
  );
}
