import { Comment } from '~/components/comment';

export default function MyOfferComments() {
  return (
    <div>
      <section className="mb-10">
        <div className="mb-6">
          <h2 className="title">Item1 Title</h2>
          <p className="title">$100</p>
        </div>
        <ul className="flex flex-col gap-6">
          {new Array(10).fill('').map((comment, i) => (
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
          {new Array(10).fill('').map((comment, i) => (
            <li key={i}>
              <Comment />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
