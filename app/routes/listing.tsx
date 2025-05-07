import type { Route } from './+types/listing';
import { db } from '~/utils/db.server';
import { formatDate, getImageUrl } from '~/utils/misc';
import { useOptionalUser } from '~/utils/user';
import { Link } from 'react-router';
import { appRoute } from '~/routes';
import { ImageGallery } from '~/components/image-gallery';

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.listingId;
  if (id === undefined) {
    throw new Response('No listingId param', { status: 400 });
  }

  const listing = await db.query.listings.findFirst({
    where: (lisings, { eq }) => eq(lisings.id, +id),
    with: {
      owner: true,
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

export default function Listing({ loaderData }: Route.ComponentProps) {
  const {
    listing: {
      title,
      description,
      images,
      sum,
      createdAt,
      condition,
      categories,
      listingAttributes,
      owner,
    },
  } = loaderData;
  const isAuth = Boolean(useOptionalUser());
  return (
    <>
      <div className="mb-10">
        <h1 className="title mb-1">{title}</h1>
        <p className="title mb-6">US ${sum}</p>
        <ImageGallery images={images.map(getImageUrl)} />
      </div>
      <h2 className="title">Description from the seller</h2>
      <p className="mb-8">{description}</p>
      <h2 className="title">Item specifics</h2>
      <table className="mb-8">
        <thead>
          <tr className="sr-only">
            <th className="pr-10">Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="pr-10 pb-1 text-gray-600">Condition</td>
            <td className="capitalize">{condition}</td>
          </tr>
          <tr>
            <td className="pr-10 pb-1 text-gray-600">Categories</td>
            <td>{categories.map(({ name }) => name).join(', ')}</td>
          </tr>
          {listingAttributes.map(({ attribute, value }) => (
            <tr key={attribute.id}>
              <td className="pr-10 pb-1 text-gray-600">{attribute.name}</td>
              <td>
                {value} {attribute.unit}
              </td>
            </tr>
          ))}
          <tr>
            <td className="pr-10 pb-1 text-gray-600">Posted</td>
            <td>{formatDate(createdAt)}</td>
          </tr>
        </tbody>
      </table>
      <h2 className="title">Seller</h2>
      <div className="mb-8 flex items-center gap-4">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-neutral-100">
          {owner.avatarUrl && <img src={owner.avatarUrl} alt={`${owner.name} avatar`} />}
        </div>
        <div>
          <p className="font-bold">{owner.name}</p>
          {isAuth ? (
            <p className="text-gray-500">Contact: {owner.email}</p>
          ) : (
            <Link className="underline" to={appRoute.login}>
              Login to contact the seller
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
