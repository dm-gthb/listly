import { ListingsGrid } from '~/components/listings-grid';
import { Pagination } from '~/components/pagination';

export default function CategoryListings() {
  return (
    <>
      <h1 className="title">Category</h1>
      <ListingsGrid listings={[]} />
      <div className="flex justify-center p-8">
        <Pagination />
      </div>
    </>
  );
}
