import { z } from 'zod';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { db } from '~/utils/db';
import type { Route } from './+types/update-listing';
import { listings, listingToCategory } from 'drizzle/schema';
import { eq } from 'drizzle-orm';
import { Form, redirect } from 'react-router';
import { appRoute } from '~/routes';
import {
  getFormProps,
  getInputProps,
  getSelectProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react';
import { FormErrorList } from '~/components/form-error-list';

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.listingId;
  if (id === undefined) {
    throw new Response('No listingId param', { status: 400 });
  }

  const listing = await db.query.listings.findFirst({
    where: (lisings, { eq }) => eq(lisings.id, +id),
    with: {
      categories: {
        columns: {
          categoryId: true,
        },
      },
    },
  });

  const categories = await db.query.categories.findMany();

  if (!listing) {
    throw new Response('Listing not found', { status: 404 });
  }

  return { listing, categories };
}

const listingEditorSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  sum: z.number().min(0),
  categoryId: z.number().min(1),
});

export async function action({ request, context, params }: Route.ActionArgs) {
  const listingId = params.listingId;
  if (listingId === undefined) {
    throw new Response('No listingId param', { status: 400 });
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: listingEditorSchema,
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { title, description, sum, categoryId } = submission.value;

  await db
    .update(listings)
    .set({
      title,
      description,
      sum,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(listings.id, +listingId));

  if (categoryId) {
    await db.delete(listingToCategory).where(eq(listingToCategory.listingId, +listingId));
    await db.insert(listingToCategory).values({
      listingId: +listingId,
      categoryId,
    });
  }

  return redirect(`${appRoute.myListings}/${listingId}`);
}

export default function UpdateListing({ loaderData, actionData }: Route.ComponentProps) {
  const { listing, categories } = loaderData;
  const lastResult = actionData;
  const childCategories = categories.filter((c) => c.parentId !== null);

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(listingEditorSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: listingEditorSchema });
    },
  });

  const formControlBaseClassname = 'border-gray-200 p-2 aria-[invalid]:border-red-600';
  const inputClassname = `rounded border ${formControlBaseClassname}`;

  return (
    <>
      <h1 className="sr-only">Edit Item</h1>
      <Form method="POST" {...getFormProps(form)}>
        {/* <div className="mb-6">
            <input type="file" id="avatar" name="avatar" className="sr-only" />
            <label
              htmlFor="avatar"
              className="flex w-fit cursor-pointer items-center rounded-4xl border border-gray-600 px-4 py-2"
            >
              <span>Upload Image</span>
            </label>
          </div> */}

        <div className="mb-10 flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={fields.title.id}>Title</label>
            <input
              className={inputClassname}
              defaultValue={listing.title}
              {...getInputProps(fields.title, { type: 'text' })}
            />
            <div className="min-h-6">
              <FormErrorList id={fields.title.errorId} errors={fields.title.errors} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={fields.description.id}>Description</label>
            <textarea
              className={inputClassname}
              cols={30}
              rows={8}
              defaultValue={listing.description}
              {...getTextareaProps(fields.description)}
            />
            <div className="min-h-6">
              <FormErrorList
                id={fields.description.errorId}
                errors={fields.description.errors}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={fields.sum.id}>Price</label>
            <input
              className={inputClassname}
              defaultValue={listing.sum}
              {...getInputProps(fields.sum, { type: 'number' })}
            />
            <div className="min-h-6">
              <FormErrorList id={fields.sum.errorId} errors={fields.sum.errors} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="" htmlFor={fields.categoryId.id}>
              Category
            </label>
            <select
              className={`${formControlBaseClassname} border-b`}
              defaultValue={listing.categories[0].categoryId}
              {...getSelectProps(fields.categoryId)}
            >
              {childCategories.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <div className="min-h-6">
              <FormErrorList
                id={fields.categoryId.errorId}
                errors={fields.categoryId.errors}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" className="button-base">
            update
          </button>
        </div>
      </Form>
    </>
  );
}
