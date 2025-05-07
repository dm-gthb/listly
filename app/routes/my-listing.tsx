import { Form, Link, redirect, useActionData } from 'react-router';
import { db } from '~/utils/db.server';
import type { Route } from './+types/my-listing';
import { formatDate, invariantResponse, getImageUrl } from '~/utils/misc';
import { requireUser } from '~/utils/auth.server';
import { requireUserWithPermission } from '~/utils/permissions.server';
import { z } from 'zod';
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { FormErrorList } from '~/components/form-error-list';
import { eq } from 'drizzle-orm';
import { listings } from 'drizzle/schema';
import { appRoute } from '~/routes';
import { useReadOnlyUserRole } from '~/utils/user';
import { UserRoleAlert } from '~/components/user-role-alert';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { validateCSRF } from '~/utils/csrf.server';

export async function loader({ params, request }: Route.LoaderArgs) {
  const id = params.listingId;
  if (id === undefined) {
    throw new Response('No listingId param', { status: 400 });
  }

  const user = await requireUser(request);

  const listing = await db.query.listings.findFirst({
    where: (listings, { eq, and }) =>
      and(eq(listings.id, +id), eq(listings.ownerId, user.id)),
    with: {
      categories: {
        with: {
          category: true,
        },
      },
      listingAttributes: {
        with: {
          attribute: true,
        },
      },
    },
  });

  if (!listing) {
    throw new Response('Listing not found', { status: 404 });
  }

  const listingWithNormalizedCategories = {
    ...listing,
    categories: listing.categories.map(({ category }) => category),
  };

  return { listing: listingWithNormalizedCategories };
}

const deleteListingSchema = z.object({
  listingId: z.number(),
});
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await validateCSRF(formData, request.headers);

  const submission = parseWithZod(formData, {
    schema: deleteListingSchema,
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { listingId } = submission.value;

  const user = await requireUserWithPermission(request, 'delete:listing:own');

  const listingToDelete = await db.query.listings.findFirst({
    where: (listings, { and, eq }) =>
      and(eq(listings.id, listingId), eq(listings.ownerId, user.id)),
  });

  invariantResponse(listingToDelete, 'Not found', { status: 404 });
  await db.delete(listings).where(eq(listings.id, listingId));
  return redirect(appRoute.myListings);
}

export default function MyListing({ loaderData }: Route.ComponentProps) {
  const {
    listing: {
      id,
      title,
      description,
      sum,
      condition,
      images,
      categories,
      createdAt,
      updatedAt,
      listingAttributes,
    },
  } = loaderData;
  const readOnlyUserRole = useReadOnlyUserRole();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="title mb-0">{title}</h1>
      <div className="flex flex-wrap gap-3">
        {images.map((imageId, i) => (
          <a key={imageId} href={getImageUrl(imageId)}>
            <img
              className="h-32 w-32 rounded-lg object-cover"
              src={getImageUrl(imageId)}
              alt={`image ${i} of ${images.length}`}
            />
          </a>
        ))}
      </div>
      <p className="title mb-0">${sum}</p>
      <p>{description}</p>
      <table className="w-fit">
        <thead>
          <tr className="sr-only">
            <th className="pr-2">Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">Categories</td>
            <td className="border p-2 capitalize">
              {categories.map(({ name }) => name).join(', ')}
            </td>
          </tr>
          {listingAttributes?.map(({ attribute, value }) => (
            <tr key={attribute.id}>
              <td className="border p-2">{attribute.name}</td>
              <td className="border p-2 capitalize">
                {value} {attribute.unit}
              </td>
            </tr>
          ))}
          <tr>
            <td className="border p-2">Condition</td>
            <td className="border p-2 capitalize">{condition}</td>
          </tr>
          <tr>
            <td className="border p-2 pr-4">Created</td>
            <td className="border p-2 capitalize">{formatDate(createdAt)}</td>
          </tr>
          <tr>
            <td className="border p-2 pr-4">Updated</td>
            <td className="border p-2 capitalize">{formatDate(updatedAt)}</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="edit"
          className="button-base w-fit min-w-[150px] bg-gray-600 py-2.5 text-white hover:opacity-90"
        >
          Edit
        </Link>
        {readOnlyUserRole ? (
          <UserRoleAlert role={readOnlyUserRole}>
            <button
              type="button"
              className="button-base w-fit min-w-[150px] bg-red-600 py-2.5 text-white hover:opacity-90"
            >
              Delete
            </button>
          </UserRoleAlert>
        ) : (
          <DeleteListing id={id} />
        )}
      </div>
    </div>
  );
}

function DeleteListing({ id }: { id: number }) {
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult: actionData,
    constraint: getZodConstraint(deleteListingSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: deleteListingSchema });
    },
  });

  return (
    <Form method="POST" {...getFormProps(form)}>
      <input {...getInputProps(fields.listingId, { type: 'hidden' })} value={id} />
      <AuthenticityTokenInput />
      <button
        type="submit"
        className="button-base w-fit min-w-[150px] bg-red-600 py-2.5 text-white hover:opacity-90"
      >
        Delete
      </button>
      <FormErrorList errors={form.errors} id={form.errorId} />
    </Form>
  );
}
