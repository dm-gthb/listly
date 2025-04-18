import type { Route } from './+types/home';
import { Categories } from '~/components/categories';
import { ListingsGrid } from '~/components/listings-grid';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return {
    categories: [
      { id: 0, name: 'electronics' },
      { id: 1, name: 'books' },
      { id: 2, name: 'games' },
      { id: 3, name: 'clothing' },
      { id: 4, name: 'cars' },
      { id: 5, name: 'other' },
    ],
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { categories } = loaderData;
  return (
    <>
      <div className="mb-8">
        <Categories categories={categories} />
      </div>
      <OffersSection title="Most recent" items={[]} />
      <OffersSection title="Most popular" items={[]} />
    </>
  );
}

function OffersSection({ title, items }: { title: string; items: {}[] }) {
  return (
    <section className="mb-8">
      <h2 className="title">{title}</h2>
      <ListingsGrid />
    </section>
  );
}
