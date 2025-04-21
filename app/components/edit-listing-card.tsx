import type { ListingWithCategories } from 'drizzle/types';
import { Link } from 'react-router';
import { appRoute } from '~/routes';

export function EditListingCard({ listing }: { listing: ListingWithCategories }) {
  const { id, title, description, images, sum } = listing;
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-gray-50 shadow">
      <Link
        to={`${appRoute.updateListing}/${id}`}
        className="grow-1 transition-opacity hover:opacity-90"
      >
        <div className="aspect-square">
          <img
            className="block h-full w-full object-cover"
            src={images[0]}
            alt={`${title} image`}
          />
        </div>
        <div className="flex flex-col gap-1 px-2 py-3">
          <div className="mb-1 flex justify-between gap-1 font-bold">
            <h3>{title}</h3>
            <span>${sum}</span>
          </div>
          <span className="text-sm">{description}</span>
        </div>
      </Link>
      <Link
        to={`${appRoute.updateListing}/1`}
        className="block w-full cursor-pointer bg-gray-600 p-2 text-center font-bold text-white transition-opacity hover:opacity-80"
      >
        Edit
      </Link>
      <button
        onClick={() => console.log('delete')}
        className="w-full cursor-pointer bg-red-600 p-2 font-bold text-white transition-opacity hover:opacity-80"
      >
        Delete
      </button>
    </div>
  );
}
