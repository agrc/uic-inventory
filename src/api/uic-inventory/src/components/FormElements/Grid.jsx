import GridHeading from './GridHeading';
import { BackButton } from '../PageElements';
import clsx from 'clsx';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

export function FormGrid({ children }) {
  return <div className="grid h-full grid-cols-6 gap-6">{children}</div>;
}

export function PageGrid({
  children,
  heading,
  subtext,
  site,
  submit = false,
  disabled = false,
  submitLabel = 'Save',
  back = false,
  primary = true,
  status = 'idle',
}) {
  return (
    <div className="md:grid md:grid-cols-3 md:gap-6">
      <GridHeading text={heading} subtext={subtext} site={site} />
      <div className="mt-5 md:col-span-2 md:mt-0">
        <div className="overflow-hidden shadow sm:rounded-md">
          <div className="bg-white px-4 py-5 sm:p-6">{children}</div>
          <Buttons
            status={status}
            submit={submit}
            primary={primary}
            submitLabel={submitLabel}
            back={back}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

const Buttons = ({ status, submit, submitLabel, back, disabled, primary }) => {
  if (submit || back) {
    return (
      <div className={clsx({ 'flex justify-between': back }, 'bg-gray-100 px-4 py-3 text-right sm:px-6')}>
        {back ? <BackButton /> : null}
        {submit ? (
          <button
            type="submit"
            data-style={primary ? 'primary' : 'secondary'}
            disabled={disabled || status === 'loading'}
          >
            {status === 'loading' && (
              <svg
                className="-ml-1 mr-2 h-5 w-5 animate-spin motion-reduce:hidden"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {status === 'error' && <ExclamationCircleIcon className="-ml-1 mr-2 h-5 w-5 text-red-500" />}
            {submitLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return null;
};
