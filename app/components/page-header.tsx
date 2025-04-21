import { Form, NavLink, useNavigate } from 'react-router';
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

export function PageHeader() {
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
    <div className="border-b border-gray-300">
      <header className="global-container">
        <nav className="flex items-center justify-between gap-10 py-4 text-lg">
          <NavLink to="/">
            <HomeIcon width={24} height={24} />
            <span className="sr-only">Home</span>
          </NavLink>
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
      </header>
    </div>
  );
}
