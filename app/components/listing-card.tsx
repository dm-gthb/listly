import type { Listing } from 'drizzle/types';
import { Link } from 'react-router';
import { appRoute } from '~/routes';

export function ListingCard({ listing }: { listing: Listing }) {
  const { id, title, description, images, sum } = listing;
  return (
    <div className="overflow-hidden rounded-lg bg-gray-50 shadow transition-opacity hover:opacity-90">
      <Link to={`${appRoute.listing}/${id}`} className="block">
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
    </div>
  );
}
