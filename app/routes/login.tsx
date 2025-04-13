import { Link } from 'react-router';
import { Spinner } from '~/components/spinner';
import { appRoute } from '~/routes';

const PASSWORD_MIN_LENGTH = 8;

export default function Login() {
  const isDisabled = false;
  const classNames = {
    input:
      'p-3 border-2 rounded dark:bg-transparent disabled:text-gray-400 border-gray-200',
    formGroup: 'flex flex-col gap-1 mb-4 last-of-type:mb-6',
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-8 py-4">
      <h1 className="title mb-10">Log In</h1>
      <div className="mb-4 w-full sm:w-96">
        <div>
          <form>
            <fieldset disabled={false}>
              <div className={classNames.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  className={classNames.input}
                  defaultValue={''}
                  autoFocus
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
                <span>Login</span>
              )}
            </button>
          </form>
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
