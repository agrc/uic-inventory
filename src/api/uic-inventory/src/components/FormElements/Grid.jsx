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
}) {
  return (
    <div className="md:grid md:grid-cols-3 md:gap-6">
      <GridHeading text={heading} subtext={subtext} site={site} />
      <div className="mt-5 md:col-span-2 md:mt-0">
        <div className="overflow-hidden shadow sm:rounded-md">
          <div className="bg-white px-4 py-5 sm:p-6">{children}</div>
          <Buttons
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
          <button type="submit" disabled={disabled}>
            {submitLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return null;
};
