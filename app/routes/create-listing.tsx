import { db } from '~/utils/db.server';
import type { Route } from './+types/create-listing';
import { listings, listingToCategory, listingAttributes } from 'drizzle/schema';
import { requireUser } from '~/utils/auth.server';
import { z } from 'zod';
import { Form, redirect, useActionData, type ActionFunctionArgs } from 'react-router';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { appRoute } from '~/routes';
import { requireUserWithPermission } from '~/utils/permissions.server';
import { useUser } from '~/utils/user';
import {
  getFormProps,
  getInputProps,
  getSelectProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react';
import { FormErrorList } from '~/components/form-error-list';
import { useState } from 'react';

function getListingSchema(
  categoryAttrs: Array<{
    attribute: {
      id: number;
      inputType: string;
    };
  }>,
) {
  const baseSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    sum: z.number().min(0),
    categoryId: z.number().min(1),
  });

  if (!categoryAttrs.length) {
    return baseSchema;
  }

  const attributeSchema = z.object(
    Object.fromEntries(
      categoryAttrs.map(({ attribute }) => [
        `attr_${attribute.id}`,
        attribute.inputType === 'number' ? z.coerce.number() : z.string().min(1),
      ]),
    ),
  );

  return baseSchema.merge(attributeSchema);
}

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
    console.log('not success', submission.error);
    return submission.reply();
  }

  const {
    title,
    description,
    sum,
    categoryId: newCategoryId,
    ...attrs
  } = submission.value;

  const user = await requireUserWithPermission(request, 'create:listing');

  // Create the listing
  const [listing] = await db
    .insert(listings)
    .values({
      title: String(title),
      description: String(description),
      sum: Number(sum),
      condition: 'new', // Default condition
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: user.id,
      images: [], // Default empty images array
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

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  const categories = await db.query.categories.findMany();

  // Get all attributes for all categories upfront
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Filter attributes based on selected category
  const currentAttributes = allCategoryAttributes.filter(
    (attr) => attr.categoryId === selectedCategoryId,
  );

  const lastResult = useActionData<typeof action>();
  const childCategories = categories.filter((c) => c.parentId !== null);
  const user = useUser();
  const isUnverifiedUser = user.roles.some(({ name }) => name === 'unverified');

  const schema = getListingSchema(currentAttributes);

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    defaultValue: {
      title: '',
      description: '',
      sum: '',
      categoryId: '',
    },
  });

  const formControlBaseClassname = 'border-gray-200 p-2 aria-[invalid]:border-red-600';
  const inputClassname = `rounded border ${formControlBaseClassname}`;

  return (
    <>
      <h1 className="sr-only">Create Item</h1>
      <Form method="POST" {...getFormProps(form)}>
        <div className="mb-10 flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={fields.title.id}>Title</label>
            <input
              className={inputClassname}
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
              {...getSelectProps(fields.categoryId)}
              onChange={(e) => {
                setSelectedCategoryId(Number(e.target.value));
              }}
            >
              <option value="">Select a category</option>
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

          <div>
            <h2 className="mb-4 text-xl font-semibold">Attributes</h2>
            {currentAttributes.map(({ attribute }) => {
              const fieldName = `attr_${attribute.id}`;

              return (
                <div key={attribute.id} className="mb-4">
                  <label className="mb-1 block font-medium text-gray-700">
                    {attribute.name}
                  </label>
                  {attribute.inputType === 'select' ? (
                    <select
                      name={fieldName}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select {attribute.name}</option>
                      {attribute.values?.map((value: { id: number; value: string }) => (
                        <option key={value.id} value={value.value}>
                          {value.value}
                        </option>
                      ))}
                    </select>
                  ) : attribute.inputType === 'number' ? (
                    <div className="flex items-center">
                      <input
                        type="number"
                        name={fieldName}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      {attribute.unit && (
                        <span className="ml-2 text-gray-500">{attribute.unit}</span>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      name={fieldName}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {isUnverifiedUser ? (
            <button
              type="button"
              className="button-base"
              onClick={() => alert('Not Allowed. Current user role: Unverified')}
            >
              Submit
            </button>
          ) : (
            <button type="submit" className="button-base">
              Submit
            </button>
          )}
        </div>
      </Form>
    </>
  );
}
