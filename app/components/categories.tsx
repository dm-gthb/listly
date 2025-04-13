import { Link } from 'react-router';
import { appRoute } from '~/routes';

export function Categories({
  categories,
}: {
  categories: Array<{ id: number; name: string }>;
}) {
  return (
    <ul className="flex gap-4 overflow-x-scroll sm:gap-6 md:gap-8 lg:gap-16">
      {categories.map(({ id, name }) => (
        <li key={id}>
          <Link
            to={`${appRoute.categoryOffers}/${id}`}
            className="group block min-w-[100px] pb-4 text-center"
          >
            <div className="mb-2 overflow-hidden rounded-full group-hover:opacity-80">
              <img src="https://placehold.co/300x300" alt="" />
            </div>
            <span className="block capitalize underline-offset-8 group-hover:underline">
              {name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
