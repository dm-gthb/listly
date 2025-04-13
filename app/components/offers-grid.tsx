import { EditOfferCard } from './edit-offer-card';
import { OfferCard } from './offer-card';

export function OffersGrid({ isEdit }: { isEdit?: boolean }) {
  return (
    <div className="mb-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
      {new Array(8)
        .fill('')
        .map((el, i) => (isEdit ? <EditOfferCard key={i} /> : <OfferCard key={i} />))}
    </div>
  );
}
