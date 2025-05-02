import { Form, Link, NavLink, useLocation, useNavigate } from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ArrowRightStartOnRectangleIcon,
  ChatBubbleLeftIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { appRoute } from '~/routes';
import type { Category } from 'drizzle/types';
import { getGroupedCategories } from '~/utils/misc';

export function PageHeader({
  categories,
  isAuthenticatedUser,
}: {
  categories: Category[];
  isAuthenticatedUser: boolean;
}) {
  const location = useLocation();
  return (
    <header>
      <div className="border-b border-gray-300">
        <nav className="global-container flex items-center justify-between gap-6 py-4 text-lg xl:gap-10">
          <NavLink to="/">
            <HomeIcon width={24} height={24} />
            <span className="sr-only">Home</span>
          </NavLink>
          <AllCategoriesMenu
            key={location.key}
            categories={getGroupedCategories(categories)}
          />
          <Form className="flex grow-1 gap-2" method="GET" action={appRoute.search}>
            <div className="relative w-full">
              <input
                type="text"
                name="q"
                className="w-full grow-1 rounded-full border-2 border-gray-500 px-6 py-2 pr-12 text-base disabled:text-gray-400"
                placeholder="Search for anything"
              />

              <button
                type="submit"
                className="absolute top-[50%] right-3 -translate-y-[50%] cursor-pointer p-3 text-gray-600 transition hover:text-gray-950 disabled:hover:text-gray-400"
              >
                <MagnifyingGlassIcon width={24} height={24} strokeWidth={2} />
                <span className="sr-only">search</span>
              </button>
            </div>
          </Form>

          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            {isAuthenticatedUser ? (
              <>
                <NavLink to={appRoute.myListings}>
                  <Squares2X2Icon width={24} height={24} />
                  <span className="sr-only">My listings</span>
                </NavLink>
                <NavLink to={appRoute.myListingComments}>
                  <ChatBubbleLeftIcon width={24} height={24} />
                  <span className="sr-only">Comments</span>
                </NavLink>
                <Form
                  method="POST"
                  action="/logout"
                  className="flex items-center justify-center"
                >
                  <button type="submit" className="cursor-pointer">
                    <ArrowRightStartOnRectangleIcon width={24} height={24} />
                    <span className="sr-only">Logout</span>
                  </button>
                </Form>
              </>
            ) : (
              <NavLink to={appRoute.login}>
                <UserIcon width={24} height={24} />
                <span className="sr-only">Login</span>
              </NavLink>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function AllCategoriesMenu({
  categories,
}: {
  categories: Array<Category & { children: Array<Category> }>;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="button-base flex max-w-fit grow-0 items-center gap-1 text-base">
          all categories
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
        <Dialog.Content className="absolute top-20 left-[50%] w-full max-w-[calc(100%-4rem)] -translate-x-[50%] rounded-lg bg-white px-6 py-8 shadow-lg focus:outline-none xl:max-w-6xl">
          <Dialog.Title className="sr-only">View All Categories</Dialog.Title>
          <Dialog.Description className="sr-only">
            Select category to view related listings.
          </Dialog.Description>
          <nav
            className={`grid w-full grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4`}
          >
            {categories.map((parentCategory) => {
              if (parentCategory.children.length === 0) {
                return null;
              }
              return (
                <div>
                  <h3 className="mb-2 font-bold">{parentCategory.name}</h3>
                  <ul className="">
                    {parentCategory.children.map(({ id, name }) => (
                      <li key={id}>
                        <Link
                          className="mb-1.5 block cursor-pointer hover:underline"
                          to={`${appRoute.categoryListings}/${id}`}
                        >
                          {name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
          <Dialog.Close className="absolute top-2 right-2 cursor-pointer p-1">
            <XMarkIcon width={24} height={24} />
            <span className="sr-only">close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
