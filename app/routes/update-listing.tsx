import { db } from '~/utils/db.server';
import type { Route } from './+types/update-listing';
import { listings } from 'drizzle/schema';
import { requireUser } from '~/utils/auth.server';
import { action } from './listing-editor';
import { ListingEditorForm } from './listing-editor-form';

export async function loader({ request, params }: Route.LoaderArgs) {
  const id = params.listingId;
  if (id === undefined) {
    throw new Response('No listingId param', { status: 400 });
  }

  const user = await requireUser(request);
  const listing = await db.query.listings.findFirst({
    where: (lisings, { and, eq }) =>
      and(eq(lisings.id, +id), eq(listings.ownerId, user.id)),
    with: {
      categories: true,
    },
  });

  if (!listing) {
    throw new Response('Listing not found', { status: 404 });
  }

  const categories = await db.query.categories.findMany();
  return { listing, categories };
}

export default function UpdateListing({ loaderData }: Route.ComponentProps) {
  const { listing, categories } = loaderData;
  return <ListingEditorForm listing={listing} categories={categories} />;
}

export { action };
