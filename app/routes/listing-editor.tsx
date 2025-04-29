import { redirect, type ActionFunctionArgs } from 'react-router';
import { eq } from 'drizzle-orm';
import { listings, listingToCategory } from 'drizzle/schema';
import { parseWithZod } from '@conform-to/zod';
import { db } from '~/utils/db.server';
import { appRoute } from '~/routes';
import { requireUserWithPermission } from '~/utils/permissions.server';
import { listingEditorSchema } from './listing-editor-form';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: listingEditorSchema,
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { id, title, description, sum, categoryId } = submission.value;
  const isUpdate = id !== undefined;
  const user = await requireUserWithPermission(
    request,
    isUpdate ? 'update:listing:own' : 'create:listing:own',
  );

  if (isUpdate) {
    await db
      .update(listings)
      .set({
        title,
        description,
        sum,
        updatedAt: new Date().toISOString(),
        ownerId: user.id,
      })
      .where(eq(listings.id, id));

    await db.delete(listingToCategory).where(eq(listingToCategory.listingId, id));
    await db.insert(listingToCategory).values({
      listingId: id,
      categoryId,
    });

    return redirect(`${appRoute.myListings}/${id}`);
  }

  const [insertedListing] = await db
    .insert(listings)
    .values({
      title,
      description,
      sum,
      ownerId: user.id,
      images: ['https://picsum.photos/seed/listing100/600/400'], // todo
      condition: 'new', // todo
    })
    .returning();

  await db.insert(listingToCategory).values({
    listingId: +insertedListing.id,
    categoryId,
  });

  return redirect(`${appRoute.myListings}/${insertedListing.id}`);
}
