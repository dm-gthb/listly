import { type RouteConfig, index, route } from '@react-router/dev/routes';

export const appRoute = {
  register: '/register',
  login: '/login',
  search: '/search',
  myListings: '/my',
  myListingComments: '/my/comments',
  listing: '/listing',
  createListing: '/listings/add',
  updateListing: '/listings/edit',
  categoryListings: '/listings/category',
};

export default [
  index('routes/home.tsx'),
  route(appRoute.register, 'routes/register.tsx'),
  route(appRoute.login, 'routes/login.tsx'),
  route(appRoute.search, 'routes/search.tsx'),
  route(`${appRoute.listing}/:listingId`, 'routes/listing.tsx'),
  route(appRoute.myListings, 'routes/my-listings.tsx'),
  route(appRoute.myListingComments, 'routes/my-listings-comments.tsx'),
  route(appRoute.createListing, 'routes/create-listing.tsx'),
  route(`${appRoute.updateListing}/:listingId`, 'routes/update-listing.tsx'),
  route(`${appRoute.categoryListings}/:categoryId`, 'routes/category-listings.tsx'),
] satisfies RouteConfig;
