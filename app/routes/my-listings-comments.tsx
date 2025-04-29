import type { LoaderFunctionArgs } from 'react-router';
import { Comment } from '~/components/comment';
import { requireUser } from '~/utils/auth.server';
import { db } from '~/utils/db.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const listings = await db.query.listings.findMany({
    where: (lisings, { eq }) => eq(lisings.ownerId, user.id),
    with: {
      categories: true,
      comments: true,
    },
    orderBy: (listings, { asc }) => [asc(listings.createdAt)],
  });
  return { listings };
}

export default function MyListingsComments() {
  // todo comments ui
  return (
    <div>
      <section className="mb-10">
        <div className="mb-6">
          <h2 className="title">Item1 Title</h2>
          <p className="title">$100</p>
        </div>
        <ul className="flex flex-col gap-6">
          {new Array(10).fill('').map((_comment, i) => (
            <li key={i}>
              <Comment />
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <div className="mb-6">
          <h2 className="title">Item2 Title</h2>
          <p className="title">$100</p>
        </div>
        <ul className="flex flex-col gap-6">
          {new Array(10).fill('').map((_comment, i) => (
            <li key={i}>
              <Comment />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
