import { redirect, type ActionFunctionArgs } from 'react-router';
import { eq } from 'drizzle-orm';
import { listingAttributes, listings, listingToCategory } from 'drizzle/schema';
import { parseWithZod } from '@conform-to/zod';
import { db } from '~/utils/db.server';
import { appRoute } from '~/routes';
import { requireUserWithPermission } from '~/utils/permissions.server';
import { getListingSchema } from './listing-editor-form';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const categoryId = Number(formData.get('categoryId'));

  // Get attributes for the category
  const categoryAttrs = await db.query.categoryToAttribute.findMany({
    where: (categoryToAttribute, { eq }) =>
      eq(categoryToAttribute.categoryId, categoryId),
    with: {
      attribute: {
        with: {
          values: true,
        },
      },
    },
  });

  const schema = getListingSchema(categoryAttrs);
  const submission = parseWithZod(formData, {
    schema,
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const {
    id,
    title,
    description,
    sum,
    categoryId: newCategoryId,
    condition,
    ...attrs
  } = submission.value;

  const isUpdate = id !== undefined;
  const user = await requireUserWithPermission(
    request,
    isUpdate ? 'update:listing:own' : 'create:listing:own',
  );

  if (isUpdate) {
    // Update listing with core fields
    await db
      .update(listings)
      .set({
        title: String(title),
        description: String(description),
        sum: Number(sum),
        updatedAt: new Date().toISOString(),
        ownerId: user.id,
      })
      .where(eq(listings.id, Number(id)));

    // Update category todo:if changed
    await db.delete(listingToCategory).where(eq(listingToCategory.listingId, Number(id)));
    await db.insert(listingToCategory).values({
      listingId: Number(id),
      categoryId: Number(newCategoryId),
    });

    // Update attributes
    const attributeEntries = Object.entries(attrs).map(([key, value]) => ({
      listingId: Number(id),
      attributeId: parseInt(key.replace('attr_', '')),
      value: String(value),
    }));

    await db.delete(listingAttributes).where(eq(listingAttributes.listingId, Number(id)));
    if (attributeEntries.length > 0) {
      await db.insert(listingAttributes).values(attributeEntries);
    }

    return redirect(`${appRoute.myListings}/${id}`);
  }

  // Create listing
  const [listing] = await db
    .insert(listings)
    .values({
      title: String(title),
      description: String(description),
      sum: Number(sum),
      condition: String(condition),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: user.id,
      images: [`https://picsum.photos/seed/600/400`],
    })
    .returning();

  // Create category relationship
  await db.insert(listingToCategory).values({
    listingId: listing.id,
    categoryId: Number(newCategoryId),
  });

  // Create attributes
  const attributeEntries = Object.entries(attrs).map(([key, value]) => ({
    listingId: listing.id,
    attributeId: parseInt(key.replace('attr_', '')),
    value: String(value),
  }));

  if (attributeEntries.length > 0) {
    await db.insert(listingAttributes).values(attributeEntries);
  }

  return redirect(`${appRoute.myListings}/${listing.id}`);
}
