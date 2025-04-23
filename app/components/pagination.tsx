import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getUpdatedSearchParamsString } from '~/utils/misc';

const linkBaseClassname = 'flex h-10 w-10 items-center justify-center rounded-full';

export function Pagination({
  allPagesCount,
  currentPage,
  width = 5,
}: {
  allPagesCount: number;
  currentPage: number;
  width?: number;
}) {
  const paginationRadius = Math.floor(width / 2);
  const paginationWidth = Math.min(allPagesCount, width);
  const pages =
    currentPage <= Math.ceil(width / 2)
      ? new Array(paginationWidth).fill(1).map((page, i) => page + i)
      : new Array(paginationWidth)
          .fill(
            currentPage + paginationRadius < allPagesCount
              ? currentPage - paginationRadius
              : allPagesCount - width + 1 || 1,
          )
          .map((page, i) => page + i);

  return (
    <nav aria-labelledby="pagination">
      <h2 className="sr-only" id="pagination">
        Pagination
      </h2>
      <ul className="flex gap-2">
        {currentPage > 1 ? (
          <li>
            <PaginationLink page={currentPage - 1}>
              <ChevronLeftIcon width={24} height={24} />
            </PaginationLink>
          </li>
        ) : (
          <div className={linkBaseClassname}>
            <ChevronLeftIcon className="text-gray-400" width={24} height={24} />
          </div>
        )}
        {pages.map((page) => (
          <PaginationLink key={page} page={page} isCurrent={page === currentPage} />
        ))}
        {currentPage < allPagesCount ? (
          <li>
            <PaginationLink page={currentPage + 1}>
              <ChevronRightIcon width={24} height={24} />
            </PaginationLink>
          </li>
        ) : (
          <div className={linkBaseClassname}>
            <ChevronRightIcon className="text-gray-400" width={24} height={24} />
          </div>
        )}
      </ul>
    </nav>
  );
}

function PaginationLink({
  page,
  isCurrent,
  children,
}: {
  page: number;
  isCurrent?: boolean;
  children?: ReactNode;
}) {
  const [searchParams] = useSearchParams();
  return (
    <Link
      className={`${isCurrent ? 'pointer-events-none bg-gray-200' : ''} ${linkBaseClassname} hover:bg-gray-100`}
      {...(isCurrent ? { ['aria-current']: 'page' } : {})}
      to={{
        search: getUpdatedSearchParamsString({
          initialSearchParams: searchParams,
          updates: { page },
        }),
      }}
    >
      {children ? children : page}
    </Link>
  );
}
