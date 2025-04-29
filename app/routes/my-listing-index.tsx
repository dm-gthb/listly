import type { LoaderFunctionArgs } from 'react-router';
import { requireUser } from '~/utils/auth.server';
import { db } from '~/utils/db.server';
import type { Route } from './+types/my-listing-index';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const listings = await db.query.listings.findMany({
    where: (lisings, { eq }) => eq(lisings.ownerId, user.id),
  });
  return { listings };
}

export default function MyListingIndex({ loaderData }: Route.ComponentProps) {
  const { listings } = loaderData;
  return listings.length > 0 ? (
    <div>
      <p>Select Item</p>
    </div>
  ) : null;
}
