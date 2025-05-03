import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { Form, Link, redirect } from 'react-router';
import { z } from 'zod';
import { Spinner } from '~/components/spinner';
import { appRoute } from '~/routes';
import type { Route } from './+types/register';
import { FormErrorList } from '~/components/form-error-list';
import { db } from '~/utils/db.server';
import {
  getSessionExpirationDate,
  requireAnonymous,
  setUserIdCookie,
  signupUser,
} from '~/utils/auth.server';
import { sessionStorage } from '~/utils/session.server';
import { validateCSRF } from '~/utils/csrf.server';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';

const signupSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, { message: 'Name is too short' })
    .max(50, { message: 'Name is too long' }),
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email is invalid' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password is too short' })
    .max(70, { message: 'Password is too long' }),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await validateCSRF(formData, request.headers);

  const submission = await parseWithZod(formData, {
    schema: signupSchema
      .superRefine(async (data, ctx) => {
        const existingUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, data.email),
        });

        if (existingUser) {
          ctx.addIssue({
            path: ['email'],
            code: z.ZodIssueCode.custom,
            message: 'A user already exists with this email',
          });
          return;
        }
      })
      .transform(async (data) => {
        const user = await signupUser(data);
        return { ...data, user };
      }),
    async: true,
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { user } = submission.value;
  const cookieSession = await setUserIdCookie({ request, userId: user.id });
  return redirect('/', {
    headers: {
      'set-cookie': await sessionStorage.commitSession(cookieSession, {
        expires: getSessionExpirationDate(),
      }),
    },
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAnonymous(request);
  return {};
}

export default function Register({ actionData }: Route.ComponentProps) {
  const lastResult = actionData;

  const isDisabled = false;
  const classNames = {
    input:
      'aria-[invalid]:border-red-500 p-3 border-2 rounded dark:bg-transparent disabled:text-gray-400 border-gray-200',
    formGroup: 'flex flex-col gap-1 mb-3 last-of-type:mb-4',
  };

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(signupSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signupSchema });
    },
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-8 py-4">
      <h1 className="title mb-10">Sign Up</h1>
      <div className="mb-4 w-full sm:w-96">
        <div>
          <Form method="POST" {...getFormProps(form)}>
            <AuthenticityTokenInput />
            <fieldset disabled={false}>
              <div className={classNames.formGroup}>
                <label htmlFor="username">Name</label>
                <input
                  {...getInputProps(fields.name, { type: 'text' })}
                  autoComplete="username"
                  className={classNames.input}
                  autoFocus
                />
                <div className="-mt-1 min-h-6">
                  <FormErrorList id={fields.name.errorId} errors={fields.name.errors} />
                </div>
              </div>
              <div className={classNames.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  {...getInputProps(fields.email, { type: 'email' })}
                  autoComplete="email"
                  className={classNames.input}
                />
                <div className="-mt-1 min-h-6">
                  <FormErrorList id={fields.email.errorId} errors={fields.email.errors} />
                </div>
              </div>
              <div className={classNames.formGroup}>
                <label htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    {...getInputProps(fields.password, { type: 'password' })}
                    className={`${classNames.input} w-full pr-11`}
                    autoComplete="current-password"
                  />
                  <div className="-mt-1 min-h-6">
                    <FormErrorList
                      id={fields.password.errorId}
                      errors={fields.password.errors}
                    />
                  </div>
                </div>
              </div>
            </fieldset>
            <FormErrorList errors={form.errors} id={form.errorId} />
            <button
              type="submit"
              disabled={isDisabled}
              className="button-base mt-1 min-h-14"
            >
              {isDisabled ? (
                <Spinner
                  width={20}
                  height={20}
                  className="inline animate-spin fill-gray-500 text-center text-gray-50 dark:fill-gray-50 dark:text-gray-600"
                />
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </Form>
        </div>
      </div>
      <div>
        Already have an account?{' '}
        <Link
          to={appRoute.login}
          className="underline disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
