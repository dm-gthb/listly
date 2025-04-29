import { queryUserWithRolesAndPermissions, requireUser } from './auth.server';

export async function requireUserWithPermission(
  request: Request,
  permission: PermissionString,
) {
  const userData = await requireUser(request);
  const user = await queryUserWithRolesAndPermissions(userData.id);

  if (!user) {
    throw new Response(`User not found`, { status: 401 });
  }

  const { action, entity, access } = parsePermissionString(permission);

  const permissions = user.roles.flatMap((r) => r.permissions);

  const hasPermission = permissions.some(
    (permission) =>
      permission.action === action &&
      permission.entity === entity &&
      (!access || access.includes(permission.access as Access)),
  );

  if (!hasPermission) {
    throw new Response(`Unauthorized: required permission: ${permission}`, {
      status: 403,
    });
  }

  return user;
}

type Action = 'create' | 'read' | 'update' | 'delete';
type Entity = 'user' | 'listing';
type Access = 'own' | 'any' | 'own,any' | 'any,own';
type PermissionString = `${Action}:${Entity}` | `${Action}:${Entity}:${Access}`;

function parsePermissionString(permissionString: PermissionString) {
  const [action, entity, access] = permissionString.split(':') as [
    Action,
    Entity,
    Access | undefined,
  ];
  return {
    action,
    entity,
    access: access ? (access.split(',') as Array<Access>) : undefined,
  };
}
