import { db } from '~/utils/db.server';
import type { Route } from './+types/update-listing';
import { requireUser } from '~/utils/auth.server';
import { action } from './listing-editor';
import { ListingEditorForm } from './listing-editor-form';

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  const categories = await db.query.categories.findMany();
  return { categories };
}

export default function CreateListing({ loaderData }: Route.ComponentProps) {
  const { categories } = loaderData;
  return <ListingEditorForm categories={categories} />;
}

export { action };
