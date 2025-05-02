import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import type { Route } from './+types/home';
import { ListingsGrid } from '~/components/listings-grid';
import { db } from '~/utils/db.server';
import { Link } from 'react-router';
import { appRoute } from '~/routes';
import type { Category } from 'drizzle/types';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { getGroupedCategories } from '~/utils/misc';

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
    orderBy: (listings, { desc }) => [desc(listings.createdAt)],
    limit: 8,
  });
  return { categories, latestListings };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { categories, latestListings } = loaderData;
  const groupedCategories = getGroupedCategories(categories);
  return (
    <>
      <div className="relative -mt-6 mb-2 flex items-center justify-items-start gap-8">
        <div className="hidden lg:block">
          <SelectedCategoriesMenu categories={groupedCategories.slice(0, 7)} />
        </div>
      </div>
      <section
        className="mb-10 flex h-[360px] flex-col justify-center rounded-2xl bg-[url('https://picsum.photos/seed/listly/1200/800')] bg-cover bg-center bg-no-repeat p-20 text-white"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backgroundBlendMode: 'overlay' }}
      >
        <h2 className="title font-bold">Welcome to Listly</h2>
        <p className="text-lg">Buy, sell, and discover great deals in your community.</p>
        <p className="text-lg">List your items or find what you need—fast and easy.</p>
      </section>
      <section className="mb-8">
        <h2 className="title">Latest Listings</h2>
        <ListingsGrid listings={latestListings} />
      </section>
    </>
  );
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
              <NavigationMenu.Content className="absolute top-10 -left-4 z-1 w-max min-w-[calc(100%+2.5rem)] rounded-md bg-white p-3 shadow-xl">
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
