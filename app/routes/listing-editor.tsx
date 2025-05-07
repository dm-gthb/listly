import { redirect, type ActionFunctionArgs } from 'react-router';
import { eq } from 'drizzle-orm';
import { listingAttributes, listings, listingToCategory } from 'drizzle/schema';
import { parseWithZod } from '@conform-to/zod';
import { db } from '~/utils/db.server';
import { appRoute } from '~/routes';
import { requireUserWithPermission } from '~/utils/permissions.server';
import { getListingSchema } from './listing-editor-form';
import { validateCSRF } from '~/utils/csrf.server';
import { type FileUpload, parseFormData } from '@mjackson/form-data-parser';
import { invariantResponse } from '~/utils/misc';

export async function action({ request, context }: ActionFunctionArgs) {
  async function uploadHandler(fileUpload: FileUpload) {
    if (fileUpload.type.split('/')[0] === 'image') {
      const storageKey = `${crypto.randomUUID()}`;
      const arrayBuffer = await fileUpload.arrayBuffer();
      await context.cloudflare.env.R2.put(storageKey, arrayBuffer);
      return storageKey;
    }
  }
  const formData = await parseFormData(request, uploadHandler);
  console.log('formData');
  console.log(formData);

  await validateCSRF(formData, request.headers);

  console.log('validateCSRF done');

  const categoryId = Number(formData.get('categoryId'));
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
  console.log('parseWithZod done');
  if (submission.status !== 'success') {
    console.log('submission.status !== success');
    return submission.reply();
  }

  const {
    id,
    title,
    description,
    sum,
    categoryId: newCategoryId,
    condition,
    images,
    ...attrs
  } = submission.value;

  const isUpdate = id !== undefined;
  const user = await requireUserWithPermission(
    request,
    isUpdate ? 'update:listing:own' : 'create:listing:own',
  );

  const newImages = Array.isArray(images)
    ? (images
        .map((image) => {
          const value = Object.values(image)[0];
          if (typeof value === 'string') {
            return value;
          }
          return null;
        })
        .filter(Boolean) as string[])
    : [];

  if (isUpdate) {
    const currentListing = await db.query.listings.findFirst({
      where: eq(listings.id, Number(id)),
    });

    invariantResponse(currentListing, 'Listing not found', { status: 404 });

    const currentImages = currentListing.images;
    const imagesToDelete = currentImages.filter((image) => !newImages.includes(image));

    await Promise.all(
      imagesToDelete.map(async (img) => {
        try {
          await context.cloudflare.env.R2.delete(img);
        } catch (error) {
          console.error(`Failed to delete image ${img}:`, error);
        }
      }),
    );

    await db
      .update(listings)
      .set({
        title: String(title),
        description: String(description),
        sum: Number(sum),
        updatedAt: new Date().toISOString(),
        ownerId: user.id,
        images: newImages,
      })
      .where(eq(listings.id, Number(id)));

    await db.delete(listingToCategory).where(eq(listingToCategory.listingId, Number(id)));
    await db.insert(listingToCategory).values({
      listingId: Number(id),
      categoryId: Number(newCategoryId),
    });

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
      images: newImages,
    })
    .returning();

  await db.insert(listingToCategory).values({
    listingId: listing.id,
    categoryId: Number(newCategoryId),
  });

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
