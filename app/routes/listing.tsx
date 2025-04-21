import type { Route } from './+types/listing';
import { db } from '~/utils/db';
import { formatDate } from '~/utils/misc';

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.listingId;
  if (id === undefined) {
    throw new Response('No listingId param', { status: 400 });
  }

  const listing = await db.query.listings.findFirst({
    where: (lisings, { eq }) => eq(lisings.id, +id),
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

export default function Listing({ loaderData }: Route.ComponentProps) {
  const {
    listing: { title, description, images, sum, createdAt, condition, categories },
  } = loaderData;
  return (
    <>
      <div className="mb-4 flex flex-col gap-8 pb-8 lg:flex-row">
        <div className="flex h-[500px] w-full shrink-0 justify-center overflow-hidden rounded-xl bg-stone-100 text-center lg:w-2/3">
          <img
            src={images[0]}
            alt={`${title} image`}
            className="max-h-full max-w-full object-contain text-center"
          />
        </div>
        <div>
          <h1 className="title mb-2">{title}</h1>
          <p className="title mb-6">US ${sum}</p>
          <button className="button-base mb-3 bg-blue-600 font-bold text-white hover:bg-blue-500">
            Add To Cart
          </button>
          <button className="button-base mb-3">add to watchlist</button>
          <button className="button-base mb-6">show contacts</button>
        </div>
      </div>

      <h2 className="title">Description from the seller</h2>
      <p className="mb-8">{description}</p>
      <h2 className="title">Item specifics</h2>
      <table className="mb-8">
        <th className="sr-only">
          <th className="pr-2">Property</th>
          <th>Value</th>
        </th>
        <tr>
          <td className="pr-4 text-gray-600">Condition</td>
          <td className="capitalize">{condition}</td>
        </tr>
        <tr>
          <td className="pr-4 text-gray-600">Categories</td>
          <td>{categories.map(({ name }) => name).join(', ')}</td>
        </tr>
        <tr>
          <td className="pr-4 text-gray-600">Posted</td>
          <td>{formatDate(createdAt)}</td>
        </tr>
      </table>

      {/* <h3 className="title">Comments</h3>
      <CreateComment />
      <ul className="flex flex-col gap-10">
        {new Array(10).fill('').map((comment, i) => (
          <li key={i}>
            <Comment />
          </li>
        ))}
      </ul> */}
    </>
  );
}
