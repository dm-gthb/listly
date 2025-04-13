import { Link } from 'react-router';

export function Pagination() {
  return (
    <ul className="flex gap-4">
      <li className="">
        <Link
          to={'?page=1'}
          className="flex min-h-10 min-w-10 items-center justify-center rounded-full bg-gray-200"
        >
          1
        </Link>
      </li>
      <li>
        <Link
          to={'?page=2'}
          className="flex min-h-10 min-w-10 items-center justify-center rounded-full"
        >
          2
        </Link>
      </li>
      <li>
        <Link
          to={'?page=3'}
          className="flex min-h-10 min-w-10 items-center justify-center rounded-full"
        >
          3
        </Link>
      </li>
    </ul>
  );
}
