import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import type { Route } from './+types/home';
import { ListingsGrid } from '~/components/listings-grid';
import { getDB } from '~/utils/drizzle';
import type { categories } from 'drizzle/schema';
import { Link } from 'react-router';
import { appRoute } from '~/routes';

type Category = typeof categories.$inferSelect;

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = getDB(context.cloudflare.env.DB);
  const categories = await db.query.categories.findMany();
  const latestListings = await db.query.listings.findMany({
    orderBy: (listings, { asc }) => [asc(listings.createdAt)],
    limit: 8,
  });
  return { categories, latestListings };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { categories } = loaderData;
  const groupedCategories = getGroupedCategories(categories);
  return (
    <>
      <div className="mb-8">
        <CategoriesMenu categories={groupedCategories} />
      </div>
      <section className="mb-8">
        <h2 className="title">Latest Listings</h2>
        <ListingsGrid />
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

function CategoriesMenu({
  categories,
}: {
  categories: Array<Category & { children: Array<Category> }>;
}) {
  return (
    <NavigationMenu.Root className="relative flex">
      <NavigationMenu.List className="flex flex-wrap rounded p-1">
        {categories.map((parentCategory) => {
          return (
            <NavigationMenu.Item key={parentCategory.id} className="relative shrink-0">
              <NavigationMenu.Trigger className="mr-2 mb-2 rounded-md bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300">
                {parentCategory.name}
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="absolute top-10 left-0 z-1 w-max min-w-full rounded-md bg-white p-4 shadow-xl">
                <ul className="shrink-0">
                  {parentCategory.children.map(({ id, name }) => (
                    <li key={id}>
                      <Link
                        className="inline-block cursor-pointer px-2 py-1.5 hover:underline"
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
