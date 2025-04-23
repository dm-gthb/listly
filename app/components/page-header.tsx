import { Form, Link, NavLink, useLocation, useNavigate } from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  ChatBubbleLeftIcon,
  DocumentDuplicateIcon,
  FolderPlusIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { appRoute } from '~/routes';
import type { Category } from 'drizzle/types';
import { getGroupedCategories } from '~/utils/misc';

export function PageHeader({ categories }: { categories: Category[] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = true;

  const handleLogout = () => {
    // logout();
    navigate('/');
  };

  const handleSearchFormSubmit = (formData: FormData) => {
    const searchTermValue = formData.get('searchTerm') as string;
    if (searchTermValue?.trim()) {
      navigate(`search/${searchTermValue}`);
    }
  };

  return (
    <header>
      <div className="border-b border-gray-300">
        <nav className="global-container flex items-center justify-between gap-6 py-4 text-lg">
          <NavLink to="/">
            <HomeIcon width={24} height={24} />
            <span className="sr-only">Home</span>
          </NavLink>
          <AllCategoriesMenu
            key={location.key}
            categories={getGroupedCategories(categories)}
          />
          <Form className="flex grow-1 gap-2">
            <div className="relative w-full">
              <input
                type="text"
                className="w-full grow-1 rounded-full border-2 border-gray-500 px-8 py-2 pr-12 text-base disabled:text-gray-400"
                placeholder="Search for anything"
              />

              <button className="absolute top-[50%] right-2 -translate-y-[50%] cursor-pointer p-3 text-gray-600 transition hover:text-gray-950 disabled:hover:text-gray-400">
                <MagnifyingGlassIcon width={24} height={24} strokeWidth={2} />
                <span className="sr-only">search</span>
              </button>
            </div>
          </Form>

          <div className="flex items-center gap-6 sm:gap-8 md:gap-10">
            {user && (
              <>
                <NavLink to={appRoute.createListing}>
                  <FolderPlusIcon width={24} height={24} />
                  <span className="sr-only">Add listing</span>
                </NavLink>
                <NavLink to={appRoute.myListings}>
                  <DocumentDuplicateIcon width={24} height={24} />
                  <span className="sr-only">My listings</span>
                </NavLink>
                <NavLink to={appRoute.myListingComments}>
                  <ChatBubbleLeftIcon width={24} height={24} />
                  <span className="sr-only">Comments</span>
                </NavLink>
                <button onClick={handleLogout}>
                  <ArrowLeftStartOnRectangleIcon width={24} height={24} />
                  <span className="sr-only">Logout</span>
                </button>
              </>
            )}
            {!user && (
              <NavLink to={appRoute.login}>
                <ArrowRightEndOnRectangleIcon width={24} height={24} />
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
        <Dialog.Content className="absolute top-20 left-[50%] w-full max-w-6xl -translate-x-[50%] rounded-lg bg-white px-6 py-8 shadow-lg focus:outline-none">
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
