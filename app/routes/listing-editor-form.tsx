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
import type { action } from './listing-editor';
import { useState } from 'react';
import { useReadOnlyUserRole } from '~/utils/user';
import { UserRoleAlert } from '~/components/user-role-alert';

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
    condition: z.enum(['new', 'used']),
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
  const currentAttributes = allCategoryAttributes.filter(
    (attr) => attr.categoryId === selectedCategoryId,
  );

  const lastResult = useActionData<typeof action>();
  const childCategories = categories.filter((c) => c.parentId !== null);
  const readOnlyUserRole = useReadOnlyUserRole();

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
      condition: listing?.condition ?? '',
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
        <div className="mb-10 flex flex-col gap-3">
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
            <label htmlFor={fields.condition.id}>Condition</label>
            <select
              className={`${formControlBaseClassname} border-b`}
              {...getSelectProps(fields.condition)}
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
            <div className="min-h-6">
              <FormErrorList
                id={fields.condition.errorId}
                errors={fields.condition.errors}
              />
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
              <option value="">Select category</option>
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

          <>
            {currentAttributes.map(({ attribute }) => {
              const fieldName = `attr_${attribute.id}`;
              return (
                <div key={attribute.id} className="flex flex-col gap-1">
                  <label
                    htmlFor={fields[fieldName].id}
                    className="mb-1 block font-medium text-gray-700"
                  >
                    {attribute.name} {attribute.unit ? `(${attribute.unit})` : ''}
                  </label>
                  {attribute.inputType === 'select' ? (
                    <select
                      {...getSelectProps(fields[fieldName])}
                      className={`${formControlBaseClassname} border-b`}
                    >
                      <option value="">Select {attribute.name}</option>
                      {attribute.values?.map(({ id, value }) => (
                        <option key={id} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  ) : attribute.inputType === 'number' ? (
                    <div className="flex items-center">
                      <input
                        {...getInputProps(fields[fieldName], { type: 'number' })}
                        className={inputClassname}
                      />
                      {attribute.unit && (
                        <span className="ml-2 text-gray-500">{attribute.unit}</span>
                      )}
                    </div>
                  ) : (
                    <input
                      {...getInputProps(fields[fieldName], { type: 'text' })}
                      className={inputClassname}
                    />
                  )}
                  <div className="min-h-6">
                    <FormErrorList
                      id={fields[fieldName].errorId}
                      errors={fields[fieldName].errors}
                    />
                  </div>
                </div>
              );
            })}
          </>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {readOnlyUserRole ? (
            <UserRoleAlert role={readOnlyUserRole}>
              <button type="button" className="button-base">
                Submit
              </button>
            </UserRoleAlert>
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
