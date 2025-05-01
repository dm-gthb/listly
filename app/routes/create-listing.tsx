import { db } from '~/utils/db.server';
import type { Route } from './+types/create-listing';
import { requireUser } from '~/utils/auth.server';
import { action } from './listing-editor';
import { ListingEditorForm } from './listing-editor-form';

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
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

  return { categories, allCategoryAttributes };
}

export default function CreateListing({ loaderData }: Route.ComponentProps) {
  const { categories, allCategoryAttributes } = loaderData;
  return (
    <ListingEditorForm
      categories={categories}
      allCategoryAttributes={allCategoryAttributes}
    />
  );
}

export { action };
