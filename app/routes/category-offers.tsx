import { OffersGrid } from '~/components/offers-grid';
import { Pagination } from '~/components/pagination';

export default function CategoryOffers() {
  return (
    <>
      <h1 className="title">Category</h1>
      <OffersGrid />
      <div className="flex justify-center p-8">
        <Pagination />
      </div>
    </>
  );
}
