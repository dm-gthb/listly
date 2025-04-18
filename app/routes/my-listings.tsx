import { Link } from 'react-router';
import { ListingsGrid } from '~/components/listings-grid';
import { appRoute } from '~/routes';

export default function MyListings() {
  return (
    <div>
      <div className="flex justify-center">
        <Link
          to={appRoute.createListing}
          className="mb-8 rounded-4xl border-2 border-gray-300 px-8 py-4 shadow-md"
        >
          + create new item
        </Link>
      </div>
      <ListingsGrid isEdit />
    </div>
  );
}
