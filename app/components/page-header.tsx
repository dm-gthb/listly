import { NavLink, useNavigate } from 'react-router';
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  ChatBubbleLeftIcon,
  DocumentDuplicateIcon,
  FolderPlusIcon,
  HomeIcon,
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
    <div className="shadow">
      <header className="global-container">
        <nav className="flex justify-between py-4 text-lg">
          <NavLink to="/">
            <HomeIcon width={24} height={24} />
            <span className="sr-only">Home</span>
          </NavLink>
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
