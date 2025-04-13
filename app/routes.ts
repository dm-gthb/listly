import { type RouteConfig, index, route } from '@react-router/dev/routes';

export const appRoute = {
  register: '/register',
  login: '/login',
  search: '/search',
  myOffers: '/my',
  myOfferComments: '/my/comments',
  offer: '/offer',
  createOffer: '/offers/add',
  updateOffer: '/offers/edit',
  categoryOffers: '/offers/category',
};

export default [
  index('routes/home.tsx'),
  route(appRoute.register, 'routes/register.tsx'),
  route(appRoute.login, 'routes/login.tsx'),
  route(appRoute.search, 'routes/search.tsx'),
  route(`${appRoute.offer}/:offerId`, 'routes/offer.tsx'),
  route(appRoute.myOffers, 'routes/my-offers.tsx'),
  route(appRoute.myOfferComments, 'routes/my-offers-comments.tsx'),
  route(appRoute.createOffer, 'routes/create-offer.tsx'),
  route(`${appRoute.updateOffer}/:offerId`, 'routes/update-offer.tsx'),
  route(`${appRoute.categoryOffers}/:categoryId`, 'routes/category-offers.tsx'),
] satisfies RouteConfig;
