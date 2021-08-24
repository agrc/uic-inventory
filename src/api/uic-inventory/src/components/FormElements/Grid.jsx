import GridHeading from './GridHeading';

export function FormGrid({ children }) {
  return <div className="grid grid-cols-6 gap-6">{children}</div>;
}

export function PageGrid({ children, heading, subtext, site, submit = false, disabled = false, submitLabel = 'Save' }) {
  return (
    <div className="md:grid md:grid-cols-3 md:gap-6">
      <GridHeading text={heading} subtext={subtext} site={site} />
      <div className="mt-5 md:mt-0 md:col-span-2">
        <div className="overflow-hidden shadow sm:rounded-md">
          <div className="px-4 py-5 bg-white sm:p-6">{children}</div>
          {submit ? (
            <div className="px-4 py-3 text-right bg-gray-100 sm:px-6">
              <button type="submit" disabled={disabled}>
                {submitLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
