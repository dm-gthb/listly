import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { Form, Link, redirect } from 'react-router';
import { z } from 'zod';
import { Spinner } from '~/components/spinner';
import { appRoute } from '~/routes';
import type { Route } from './+types/login';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { db } from '~/utils/db.server';
import { FormErrorList } from '~/components/form-error-list';
import { sessionStorage } from '~/utils/session.server';
import {
  checkIsValidPassword,
  getSessionExpirationDate,
  requireAnonymous,
} from '~/utils/auth.server';

const loginSchema = z.object({
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
  const submission = await parseWithZod(formData, {
    schema: () =>
      loginSchema.transform(async (data, ctx) => {
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, data.email),
        });

        const password = user
          ? await db.query.passwords.findFirst({
              where: (passwords, { eq }) => eq(passwords.userId, user.id),
            })
          : null;

        const isValidPassword = password
          ? await checkIsValidPassword({ password: data.password, hash: password.hash })
          : false;

        if (!isValidPassword || !user) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid email or password',
          });
          return z.NEVER;
        }

        return { ...data, user };
      }),
    async: true,
  });

  delete submission.payload.password;

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { user } = submission.value;
  const cookieSession = await sessionStorage.getSession(request.headers.get('cookie'));
  cookieSession.set('userId', user.id);

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

export default function Login({ actionData }: Route.ComponentProps) {
  const lastResult = actionData;
  const isDisabled = false;

  const classNames = {
    input:
      'aria-[invalid]:border-red-500 p-3 border-2 rounded dark:bg-transparent disabled:text-gray-400 border-gray-200',
    formGroup: 'flex flex-col gap-1 mb-3 last-of-type:mb-4',
  };

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(loginSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
    },
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-8 py-4">
      <h1 className="title mb-10">Log In</h1>
      <div className="mb-4 w-full sm:w-96">
        <div>
          <Form method="POST" {...getFormProps(form)}>
            <fieldset disabled={false}>
              <div className={classNames.formGroup}>
                <label htmlFor={fields.email.id}>Email</label>
                <input
                  {...getInputProps(fields.email, { type: 'email' })}
                  className={classNames.input}
                  autoComplete="email"
                  autoFocus
                />
                <div className="min-h-6">
                  <FormErrorList id={fields.email.errorId} errors={fields.email.errors} />
                </div>
              </div>
              <div className={classNames.formGroup}>
                <label htmlFor={fields.password.id}>Password</label>
                <input
                  {...getInputProps(fields.password, { type: 'password' })}
                  className={`${classNames.input} w-full pr-11`}
                  autoComplete="current-password"
                />
                <div className="min-h-6">
                  <FormErrorList
                    id={fields.password.errorId}
                    errors={fields.password.errors}
                  />
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
                <span>Login</span>
              )}
            </button>
          </Form>
        </div>
      </div>
      <div>
        Don't have an account?{' '}
        <Link
          to={appRoute.register}
          className="underline disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
