import { Link } from 'react-router';
import { OffersGrid } from '~/components/offers-grid';
import { appRoute } from '~/routes';

export default function MyOffers() {
  return (
    <div>
      <div className="flex justify-center">
        <Link
          to={appRoute.createOffer}
          className="mb-8 rounded-4xl border-2 border-gray-300 px-8 py-4 shadow-md"
        >
          + create new item
        </Link>
      </div>
      <OffersGrid isEdit />
    </div>
  );
}
