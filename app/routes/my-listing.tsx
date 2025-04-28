import { Link } from 'react-router';
import { db } from '~/utils/db';
import type { Route } from './+types/my-listing';
import { formatDate } from '~/utils/misc';
import { requireUser } from '~/utils/auth.server';

export async function loader({ params, request }: Route.LoaderArgs) {
  const id = params.listingId;
  if (id === undefined) {
    throw new Response('No listingId param', { status: 400 });
  }

  const user = await requireUser(request);

  const listing = await db.query.listings.findFirst({
    where: (lisings, { eq, and }) =>
      and(eq(lisings.id, +id), eq(lisings.ownerId, user.id)),
    with: {
      categories: {
        with: {
          category: true,
        },
      },
      comments: true,
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

export default function MyListing({ loaderData }: Route.ComponentProps) {
  const {
    listing: {
      title,
      description,
      sum,
      condition,
      images,
      categories,
      createdAt,
      updatedAt,
    },
  } = loaderData;
  return (
    <div className="flex flex-col gap-4">
      <h1 className="title mb-0">{title}</h1>
      <div className="flex flex-wrap gap-1">
        {images.map((src, i) => (
          <img
            key={src + i}
            className="block max-w-[200px]"
            src={src}
            alt={`image ${i} of ${title}`}
          />
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
            <td className="border p-2">Condition</td>
            <td className="border p-2 capitalize">{condition}</td>
          </tr>
          <tr>
            <td className="border p-2">Categories</td>
            <td className="border p-2 capitalize">
              {categories.map(({ name }) => name).join(', ')}
            </td>
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
          edit
        </Link>
        <button className="button-base w-fit min-w-[150px] bg-red-600 py-2.5 text-white hover:opacity-90">
          delete
        </button>
      </div>
    </div>
  );
}
