import { NavLink, Outlet, type LoaderFunctionArgs } from 'react-router';
import { db } from '~/utils/db.server';
import type { Route } from './+types/my-listings';
import { PlusIcon } from '@heroicons/react/24/outline';
import { requireUser } from '~/utils/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const listings = await db.query.listings.findMany({
    where: (lisings, { eq }) => eq(lisings.ownerId, user.id),
    with: { categories: true },
    orderBy: (listings, { desc }) => [desc(listings.createdAt)],
  });
  return { listings };
}

export default function MyListings({ loaderData }: Route.ComponentProps) {
  const { listings } = loaderData;
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
          {listings.map(({ id, title }) => {
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
