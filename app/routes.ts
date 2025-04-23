import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

export const appRoute = {
  register: '/register',
  login: '/login',
  search: '/search',
  listing: '/listing',
  categoryListings: '/listings/category',
  myListings: '/my/listings',
  createListing: '/my/listings/add',
  updateListing: '/my/listings/edit',
  myListingComments: '/my/comments',
};

export default [
  index('routes/home.tsx'),
  route(appRoute.register, 'routes/register.tsx'),
  route(appRoute.login, 'routes/login.tsx'),
  route(appRoute.search, 'routes/search.tsx'),
  route(`${appRoute.listing}/:listingId`, 'routes/listing.tsx'),
  route(`${appRoute.categoryListings}/:categoryId`, 'routes/category-listings.tsx'),

  ...prefix('my/listings', [
    layout('routes/my-listings.tsx', [
      index('routes/my-listing-index.tsx'),
      route(':listingId', 'routes/my-listing.tsx'),
      route(':listingId/edit', 'routes/update-listing.tsx'),
      route('/new', 'routes/create-listing.tsx'),
    ]),
  ]),
  route(appRoute.myListingComments, 'routes/my-listings-comments.tsx'),
] satisfies RouteConfig;
