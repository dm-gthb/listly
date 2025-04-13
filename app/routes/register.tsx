import { Form, Link } from 'react-router';
import { Spinner } from '~/components/spinner';
import { appRoute } from '~/routes';

const PASSWORD_MIN_LENGTH = 8;

export default function Register() {
  const isDisabled = false;
  const classNames = {
    input:
      'p-3 border-2 rounded dark:bg-transparent disabled:text-gray-400 border-gray-200',
    formGroup: 'flex flex-col gap-1 mb-4 last-of-type:mb-6',
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-8 py-4">
      <h1 className="title mb-10">Sign Up</h1>
      <div className="mb-4 w-full sm:w-96">
        <div>
          <Form method="POST" encType="multipart/form-data">
            <fieldset disabled={false}>
              <div className="mb-6">
                <input type="file" id="avatar" name="avatar" className="sr-only" />
                <label htmlFor="avatar" className="button-file">
                  <span>Upload Image</span>
                </label>
              </div>
              <div className={classNames.formGroup}>
                <label htmlFor="username">Name</label>
                <input
                  id="username"
                  type="username"
                  name="username"
                  autoComplete="username"
                  className={classNames.input}
                  defaultValue={''}
                  autoFocus
                  required
                />
              </div>
              <div className={classNames.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  className={classNames.input}
                  defaultValue={''}
                  required
                />
              </div>
              <div className={classNames.formGroup}>
                <label htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    name="password"
                    minLength={PASSWORD_MIN_LENGTH}
                    autoComplete="current-password"
                    className={`${classNames.input} w-full pr-11`}
                    defaultValue={''}
                    required
                  />
                </div>
              </div>
            </fieldset>
            <button type="submit" disabled={isDisabled} className="button-base min-h-14">
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
