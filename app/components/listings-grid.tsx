import { EditListingCard } from './edit-listing-card';
import { ListingCard } from './listing-card';

export function ListingsGrid({ isEdit }: { isEdit?: boolean }) {
  return (
    <div className="mb-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
      {new Array(8)
        .fill('')
        .map((el, i) => (isEdit ? <EditListingCard key={i} /> : <ListingCard key={i} />))}
    </div>
  );
}
