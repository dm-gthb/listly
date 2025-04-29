import bcrypt from 'bcryptjs';
import { sessionStorage } from './session.server';
import { db } from './db.server';
import { redirect } from 'react-router';
import type { User } from 'drizzle/types';
import { passwords, users } from 'drizzle/schema';

export const userIdCookieKey = 'userId';

export function getSessionExpirationDate() {
  const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
  return new Date(Date.now() + MILLISECONDS_IN_DAY * 7);
}

export async function logout(request: Request) {
  const cookieSession = await getCookieSession(request);
  throw redirect('/', {
    headers: {
      'set-cookie': await sessionStorage.destroySession(cookieSession),
    },
  });
}

export async function checkIsValidPassword({
  password,
  hash,
}: {
  password: string;
  hash: string;
}) {
  return await bcrypt.compare(password, hash);
}

export async function getUser(request: Request) {
  const cookieSession = await getCookieSession(request);
  const userId = cookieSession.get(userIdCookieKey);

  if (!userId) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  if (!user) {
    throw await logout(request);
  }

  return user;
}

export async function getUserWithRolesAndPermissions(request: Request) {
  const cookieSession = await getCookieSession(request);
  const userId = cookieSession.get(userIdCookieKey);

  if (!userId) {
    return null;
  }

  const user = await queryUserWithRolesAndPermissions(userId);

  if (!user) {
    throw await logout(request);
  }

  return user;
}

export async function setUserIdCookie({
  request,
  userId,
}: {
  request: Request;
  userId: number;
}) {
  const cookieSession = await getCookieSession(request);
  cookieSession.set(userIdCookieKey, userId);
  return cookieSession;
}

export async function requireAnonymous(request: Request) {
  const user = await getUser(request);
  if (user) {
    throw redirect('/');
  }
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    throw redirect('/');
  }

  return user;
}

export async function signupUser({
  name,
  email,
  password,
}: {
  name: User['name'];
  email: User['email'];
  password: string;
}) {
  // no transactions with d1, so simplified for now
  // https://blog.cloudflare.com/whats-new-with-d1/
  const insertedUserData = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      name: name.toLowerCase(),
    })
    .returning({ id: users.id });

  await db.insert(passwords).values({
    hash: await bcrypt.hash(password, 10),
    userId: insertedUserData[0].id,
  });
  return { id: insertedUserData[0].id };
}

async function getCookieSession(request: Request) {
  return await sessionStorage.getSession(request.headers.get('cookie'));
}

export async function queryUserWithRolesAndPermissions(userId: number) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      avatarUrl: true,
    },
    with: {
      usersToRoles: {
        with: {
          role: {
            columns: { name: true },
            with: {
              permissionsToRoles: {
                with: {
                  permission: {
                    columns: {
                      id: true,
                      action: true,
                      entity: true,
                      access: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    roles: user.usersToRoles.map((userRoles) => ({
      name: userRoles.role.name,
      permissions: userRoles.role.permissionsToRoles.map((rolePermission) => ({
        action: rolePermission.permission.action,
        entity: rolePermission.permission.entity,
        access: rolePermission.permission.access,
      })),
    })),
  };
}
