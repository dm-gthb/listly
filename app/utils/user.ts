import { useRouteLoaderData } from 'react-router';
import type { loader } from '~/root';

export function useOptionalUser() {
  const data = useRouteLoaderData<typeof loader>('root');
  return data?.user ?? null;
}

export function useUser() {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser.',
    );
  }
  return maybeUser;
}

export function useReadOnlyUserRole() {
  const user = useUser();
  const isDemoUser = user.roles.some(({ name }) => name === 'demo');
  const isUnverifiedUser = user.roles.some(({ name }) => name === 'unverified');
  return isDemoUser ? 'demo' : isUnverifiedUser ? 'unverified' : null;
}
