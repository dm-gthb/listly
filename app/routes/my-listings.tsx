import { Link, NavLink, Outlet } from 'react-router';
import { ListingsGrid } from '~/components/listings-grid';
import { appRoute } from '~/routes';
import { db } from '~/utils/db';
import type { Route } from './+types/my-listings';
import { PlusIcon } from '@heroicons/react/24/outline';

export async function loader() {
  const dummyUserListings = await db.query.listings.findMany({
    with: { categories: true },
    orderBy: (listings, { asc }) => [asc(listings.createdAt)],
    limit: 8,
  });
  return { dummyUserListings };
}

export default function MyListings({ loaderData }: Route.ComponentProps) {
  const { dummyUserListings } = loaderData;
  return (
    <div className="flex">
      <div className="shrink-0 grow-0">
        <ul className="flex flex-col gap-1 pr-6">
          <NavLink
            to={`/my/listings/new`}
            className={({ isActive }) => {
              let baseClassName = 'mb-2 flex gap-1 rounded-md p-2';
              return isActive
                ? `${baseClassName} pointer-events-none bg-blue-600 text-white`
                : `${baseClassName} hover:bg-gray-200`;
            }}
          >
            <PlusIcon width={24} height={24} />
            Add New Item
          </NavLink>
          {dummyUserListings.map(({ id, title }) => {
            return (
              <li key={id}>
                <NavLink
                  to={`/my/listings/${id.toString()}`}
                  preventScrollReset
                  prefetch="intent"
                  className={({ isActive }) => {
                    let baseClassName = 'flex gap-1 rounded-md p-2';
                    return isActive
                      ? `${baseClassName} pointer-events-none bg-blue-600 text-white`
                      : `${baseClassName} hover:bg-gray-200`;
                  }}
                >
                  {title}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="grow-1 border-l border-gray-300 py-2 pb-4 pl-10">
        <Outlet />
      </div>
    </div>
  );
}
