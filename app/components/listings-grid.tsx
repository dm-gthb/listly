import type { Listing } from 'drizzle/types';
import { EditListingCard } from './edit-listing-card';
import { ListingCard } from './listing-card';

export function ListingsGrid({
  listings,
  isEdit,
}: {
  listings: Listing[];
  isEdit?: boolean;
}) {
  return (
    <div className="mb-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
      {listings.map((listing, i) =>
        isEdit ? (
          <EditListingCard key={i} listing={listing} />
        ) : (
          <ListingCard key={i} listing={listing} />
        ),
      )}
    </div>
  );
}
