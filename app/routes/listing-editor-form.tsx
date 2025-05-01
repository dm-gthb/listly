import { Form, useActionData } from 'react-router';
import type {
  AllCategoriesWithAttribute,
  Category,
  ListingWithCategoriesAndAttributes,
} from 'drizzle/types';
import { z } from 'zod';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import {
  getFormProps,
  getInputProps,
  getSelectProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react';
import { FormErrorList } from '~/components/form-error-list';
import { useUser } from '~/utils/user';
import type { action } from './listing-editor';
import { useState } from 'react';

export function getListingSchema(
  categoryAttrs: Array<{
    attribute: {
      id: number;
      inputType: string;
    };
  }>,
) {
  const baseSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    sum: z.number().min(0),
    categoryId: z.number().min(1),
  });

  if (!categoryAttrs.length) {
    return baseSchema;
  }

  // Build dynamic schema for attributes
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

export const listingEditorSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  sum: z.number().min(0),
  categoryId: z.number().min(1),
});

export function ListingEditorForm({
  categories,
  allCategoryAttributes,
  listing,
}: {
  categories: Category[];
  allCategoryAttributes: AllCategoriesWithAttribute[];
  listing?: ListingWithCategoriesAndAttributes;
}) {
  const initialCategoryId = listing?.categories?.[0].categoryId;
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);

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
      title: listing?.title ?? '',
      description: listing?.description ?? '',
      sum: listing?.sum ?? '',
      categoryId: listing?.categories?.[0].categoryId ?? '',
      ...listing?.listingAttributes.reduce(
        (acc, attr) => {
          acc[`attr_${attr.attributeId}`] = attr.value;
          return acc;
        },
        {} as Record<string, string>,
      ),
    },
  });

  const formControlBaseClassname = 'border-gray-200 p-2 aria-[invalid]:border-red-600';
  const inputClassname = `rounded border ${formControlBaseClassname}`;

  return (
    <>
      <h1 className="sr-only">{listing ? 'Edit' : 'Create'} Item</h1>
      <Form method="POST" {...getFormProps(form)}>
        {listing ? <input type="hidden" name="id" value={listing.id} /> : null}
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
              const currentValue =
                listing?.listingAttributes.find((la) => la.attributeId === attribute.id)
                  ?.value ?? '';
              const fieldName = `attr_${attribute.id}`;

              return (
                <div key={attribute.id} className="mb-4">
                  <label className="mb-1 block font-medium text-gray-700">
                    {attribute.name}
                  </label>
                  {attribute.inputType === 'select' ? (
                    <select
                      name={fieldName}
                      defaultValue={currentValue}
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
                        defaultValue={currentValue}
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
                      defaultValue={currentValue}
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
