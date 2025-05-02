import { XMarkIcon } from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

export function UserRoleAlert({
  role,
  children,
}: {
  role: 'unverified' | 'demo';
  children: ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-10 shadow-lg focus:outline-none">
          <Dialog.Title className="sr-only">User Roles Info</Dialog.Title>
          <Dialog.Description className="sr-only">
            Get info about user roles.
          </Dialog.Description>
          <div>
            <h1 className="title mb-4">🔐 User Roles & Demo Access</h1>
            <p className="mb-4">
              This app includes multiple user roles to ensure safe and flexible
              interaction:
            </p>
            <div className="mb-6 w-fit">
              <UserRolesTable />
            </div>
            {role === 'unverified' && (
              <>
                <p className="mb-4">
                  ⚠️ Your account role is <MonoText>unverified</MonoText>, so creating,
                  editing, or deleting data is disabled.
                </p>
                <p>
                  💡 To explore how a verified user dashboard looks, browse pre-created
                  listings, and interact with forms,{' '}
                  <span className="font-bold">log in as demo user</span>:{' '}
                  <MonoText>demo_user@example.com</MonoText> /{' '}
                  <MonoText>password123</MonoText>
                </p>
              </>
            )}
            {role === 'demo' && (
              <>
                <p className="mb-4">
                  ⚠️ Your account role is <MonoText>demo</MonoText>.
                </p>
                <p>
                  💡 Demo users can open dashboards, browse pre-created listings, and
                  interact with forms. <br />
                  <span className="font-bold">
                    Creating, editing, and deleting data is disabled
                  </span>{' '}
                  to keep the demo clean.
                </p>
              </>
            )}
          </div>
          <Dialog.Close className="absolute top-2 right-2 cursor-pointer p-1">
            <XMarkIcon width={24} height={24} />
            <span className="sr-only">close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function UserRolesTable() {
  return (
    <table className="mb-6 w-fit">
      <thead>
        <tr className="border-b border-gray-400">
          <th className="pr-4 pb-2 text-left">Role</th>
          <th className="pb-2 text-left">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-gray-300">
          <td className="py-3 pr-4 align-top">
            <MonoText>admin</MonoText>
          </td>
          <td className="py-3 align-top">Full access to manage listings and users.</td>
        </tr>
        <tr className="border-b border-gray-300">
          <td className="py-3 pr-4 align-top">
            <MonoText>user</MonoText>
          </td>
          <td className="py-3 align-top">
            Verified user. Can create, edit, and delete their own listings.
          </td>
        </tr>
        <tr className="border-b border-gray-300">
          <td className="py-3 pr-4 align-top">
            <MonoText>unverified</MonoText>
          </td>
          <td className="py-3 align-top">
            Default role after signup. Can explore the UI but cannot create, edit, or
            delete any data.
          </td>
        </tr>
        <tr className="border-b border-gray-300">
          <td className="py-3 pr-4 align-top">
            <MonoText>demo</MonoText>
          </td>
          <td className="py-3 align-top">
            Pre-created user to explore features. Can view and interact with the UI, but
            all write actions are disabled.
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function MonoText({ children }: { children: string }) {
  return (
    <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">{children}</span>
  );
}
