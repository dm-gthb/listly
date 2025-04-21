import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import type { Route } from './+types/home';
import { ListingsGrid } from '~/components/listings-grid';
import { db } from '~/utils/db';
import { Link } from 'react-router';
import { appRoute } from '~/routes';
import type { Category } from 'drizzle/types';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export async function loader() {
  const categories = await db.query.categories.findMany();
  const latestListings = await db.query.listings.findMany({
    with: { categories: true },
    orderBy: (listings, { asc }) => [asc(listings.createdAt)],
    limit: 8,
  });
  return { categories, latestListings };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { categories, latestListings } = loaderData;
  const groupedCategories = getGroupedCategories(categories);
  return (
    <>
      <div className="relative -mt-6 mb-6 flex items-center justify-items-start gap-8">
        <div className="">
          <SelectedCategoriesMenu categories={groupedCategories} />
        </div>
      </div>
      <section className="mb-8">
        <h2 className="title">Latest Listings</h2>
        <ListingsGrid listings={latestListings} />
      </section>
    </>
  );
}

function getGroupedCategories(categories: Category[]) {
  const parents = categories.filter((category) => !category.parentId);
  const children = categories.filter((category) => category.parentId);
  return parents.map((parent) => ({
    ...parent,
    children: children.filter(({ parentId }) => parentId === parent.id),
  }));
}

function SelectedCategoriesMenu({
  categories,
}: {
  categories: Array<Category & { children: Array<Category> }>;
}) {
  return (
    <NavigationMenu.Root className="relative flex" delayDuration={100}>
      <NavigationMenu.List className="flex flex-wrap gap-x-6 rounded lg:gap-x-8 xl:gap-x-10">
        {categories.map((parentCategory) => {
          if (parentCategory.children.length === 0) {
            return null;
          }

          return (
            <NavigationMenu.Item key={parentCategory.id} className="relative shrink-0">
              <NavigationMenu.Trigger className="group transition-color flex items-center gap-1 py-3.5">
                {parentCategory.name}
                <ChevronDownIcon
                  className="rotate-0 transition-transform group-data-[state=open]:rotate-180"
                  width={12}
                  hanging={12}
                  strokeWidth={3}
                />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="absolute top-10 -left-4 z-1 w-max min-w-[calc(100%+2rem)] rounded-md bg-white px-2 py-2 shadow-xl">
                <ul className="shrink-0">
                  {parentCategory.children.map(({ id, name }) => (
                    <li key={id}>
                      <Link
                        className="block cursor-pointer px-2 py-1.5 hover:underline"
                        to={`${appRoute.categoryListings}/${id}`}
                      >
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          );
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
