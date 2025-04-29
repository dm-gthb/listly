import { Form, useActionData } from 'react-router';
import type { Category, ListingWithCategories } from 'drizzle/types';
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

export const listingEditorSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  sum: z.number().min(0),
  categoryId: z.number().min(1),
});

export function ListingEditorForm({
  listing,
  categories,
}: {
  listing?: ListingWithCategories;
  categories: Category[];
}) {
  const lastResult = useActionData<typeof action>();
  const childCategories = categories.filter((c) => c.parentId !== null);
  const user = useUser();
  const isUnverifiedUser = user.roles.some(({ name }) => name === 'unverified');

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(listingEditorSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: listingEditorSchema });
    },
    defaultValue: {
      title: listing?.title ?? '',
      description: listing?.description ?? '',
      sum: listing?.sum ?? '',
      categoryId: listing?.categories?.[0].categoryId ?? '',
    },
  });

  const formControlBaseClassname = 'border-gray-200 p-2 aria-[invalid]:border-red-600';
  const inputClassname = `rounded border ${formControlBaseClassname}`;

  return (
    <>
      <h1 className="sr-only">{listing ? 'Edit' : 'Create'} Item</h1>
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
