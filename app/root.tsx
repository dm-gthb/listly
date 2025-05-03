import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router';
import type { Route } from './+types/root';
import './app.css';
import { PageHeader } from './components/page-header';
import { db } from './utils/db.server';
import { getUserWithRolesAndPermissions } from './utils/auth.server';
import { csrf } from './utils/csrf.server';
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react';
import { honeypot } from './utils/honeypot.server';
import { HoneypotProvider } from 'remix-utils/honeypot/react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const [csrfToken, cookieHeader] = await csrf.commitToken(request);
  const categories = await db.query.categories.findMany();
  const user = await getUserWithRolesAndPermissions(request);
  const honeypotInputProps = await honeypot.getInputProps();
  
  return data(
    {
      categories,
      user,
      csrfToken,
      honeypotInputProps,
    },
    {
      headers: cookieHeader
        ? {
            'Set-Cookie': cookieHeader,
          }
        : {},
    },
  );
}

function App() {
  const loaderData = useLoaderData<typeof loader>();
  const { categories, user } = loaderData;
  return (
    <>
      <PageHeader categories={categories} isAuthenticatedUser={Boolean(user)} />
      <main className="global-container py-8">
        <Outlet />
      </main>
    </>
  );
}

export default function AppWithProviders() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <AuthenticityTokenProvider token={loaderData.csrfToken}>
      <HoneypotProvider {...loaderData.honeypotInputProps}>
        <App />
      </HoneypotProvider>
    </AuthenticityTokenProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
