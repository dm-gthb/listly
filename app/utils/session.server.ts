import { env } from 'cloudflare:workers';
import { createCookieSessionStorage } from 'react-router';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'user_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: env.SESSION_SECRET.split(','),
    secure: env.ENV === 'production',
  },
});
