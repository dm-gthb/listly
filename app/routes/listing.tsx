import { Link } from 'react-router';
import { Comment } from '~/components/comment';
import { CreateComment } from '~/components/create-comment';

export default function Listing() {
  return (
    <>
      <div className="mb-4 flex flex-col gap-8 pb-8 md:flex-row">
        <div className="flex h-[500px] w-full shrink-0 justify-center overflow-hidden rounded-xl bg-stone-100 text-center md:w-1/2">
          <img
            src="https://placehold.co/1200x800"
            alt=""
            className="max-h-full max-w-full object-contain text-center"
          />
        </div>

        <div>
          <h1 className="title">Lorem ipsum dolor sit amet</h1>
          <span className="title block">$1000</span>
          <p className="mb-4">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sit inventore
            assumenda vitae accusamus quos debitis veniam reprehenderit eveniet eius
            minima, adipisci tempore sunt dolorum molestias expedita repellat distinctio
            mollitia consectetur? Deleniti aut vel mollitia ipsa!
          </p>

          <p>
            <span className="font-bold">Date of posting:</span> <span>2024/10/10</span>
          </p>
          <p>
            <span className="font-bold">Condition:</span> <span>new</span>
          </p>
          <p>
            <span className="font-bold">Author:</span> <span>Name Surname</span>
          </p>
          <p>
            <span className="font-bold">Contact:</span> <span>namesurname@gmail.com</span>
          </p>
          <ul className="flex gap-2">
            <Link to="/">categorylink</Link>
            <Link to="/">categorylink</Link>
            <Link to="/">categorylink</Link>
          </ul>
        </div>
      </div>

      <h3 className="title">Comments</h3>
      <CreateComment />
      <ul className="flex flex-col gap-10">
        {new Array(10).fill('').map((comment, i) => (
          <li key={i}>
            <Comment />
          </li>
        ))}
      </ul>
    </>
  );
}
