import { db } from '~/utils/db.server';
import type { Route } from './+types/update-listing';
import { listings } from 'drizzle/schema';
import { requireUser } from '~/utils/auth.server';
import { ListingEditorForm } from './listing-editor-form';
import { action } from './listing-editor';

export async function loader({ request, params }: Route.LoaderArgs) {
  const id = params.listingId;
  const user = await requireUser(request);
  const listing = await db.query.listings.findFirst({
    with: {
      categories: true,
      listingAttributes: {
        with: {
          attribute: {
            with: {
              values: true,
            },
          },
        },
      },
    },
    where: (lisings, { and, eq }) =>
      and(eq(lisings.id, +id), eq(listings.ownerId, user.id)),
  });

  if (!listing) {
    throw new Response('Listing not found', { status: 404 });
  }

  const categories = await db.query.categories.findMany();

  const allCategoryAttributes = await db.query.categoryToAttribute.findMany({
    with: {
      attribute: {
        with: {
          values: true,
        },
      },
    },
  });

  return { listing, categories, allCategoryAttributes };
}

export default function UpdateListing({ loaderData }: Route.ComponentProps) {
  const { listing, categories, allCategoryAttributes } = loaderData;
  return (
    <ListingEditorForm
      listing={listing}
      categories={categories}
      allCategoryAttributes={allCategoryAttributes}
    />
  );
}

export { action };
