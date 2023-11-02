import { CheckIcon, LockClosedIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';
import { useRouteError } from 'react-router-dom';
import { BackButton, Link, useNavigate } from '../PageElements';

export const RouterErrorPage = ({ error }) => {
  const routeError = useRouteError();

  // authorization error
  if (routeError?.name === 'HTTPError' && routeError?.response.status === 401) {
    return <UnauthorizedRoute routeError={routeError} />;
  }

  return <UnhandledException error={error} routeError={routeError} />;
};

const UnauthorizedRoute = ({ routeError }) => {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    if (!routeError.response.bodyUsed) {
      routeError.response.json().then((data) => {
        setRules(data.errors);
      });
    }
  }, [routeError]);

  const codes = rules.map((x) => x.code);
  if (codes.includes('S03')) {
    return <IncompleteSiteWarning />;
  } else if (codes.includes('I03')) {
    return <IncompleteInventoryWarning />;
  }

  return (
    <section>
      <div className="flex flex-col items-center py-6 text-5xl font-black text-gray-800">
        <h1 className="mb-6 block">You are not allowed to be here...</h1>
        <LockClosedIcon className="block h-24 w-24" />
      </div>

      <div className="mx-auto max-w-prose">
        <p>
          This page is not accessible to you for your UIC inventory submission process. If normal usage has brought you
          here, please click the{' '}
          <Link data-style="link" to="contact">
            Contact us
          </Link>{' '}
          link and let us know what happened. Otherwise, please go back to the main page and navigate to your item of
          interest.
        </p>
        <div className="my-4 rounded border border-red-300 bg-red-100/30 px-4">
          <h3 className="my-1 text-lg font-medium text-gray-700">Violated rules</h3>
          <ul className="mb-3">
            {rules.map((rule) => (
              <li className="list-inside list-decimal" key={rule.code}>
                {rule.message}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-center text-lg">
          <BackButton />
        </p>
        <p className="mt-4">Thank you,</p>
        <p className="mt-1">The UIC Staff</p>
      </div>
    </section>
  );
};

const UnhandledException = ({ error, routeError }) => {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="mb-1 text-2xl font-medium text-gray-700">This is a little embarrassing...</h2>
      <p>
        We are really sorry. There was an error in the application that caused it to crash. You may now{' '}
        <button data-style="link" onClick={() => navigate(-1)}>
          go back
        </button>{' '}
        to the previous page and try again or{' '}
        <Link data-style="link" to="/contact" replace={true}>
          contact us
        </Link>{' '}
        to share the technical details with us from below.
      </p>
      <details className="mt-6">
        <summary>
          <span role="img" aria-label="nerd emoji">
            🤓
          </span>{' '}
          Technical Details
        </summary>
        {routeError && (
          <>
            <label htmlFor="route">Routing Error:</label>
            <pre id="route" className="overflow-auto text-base text-gray-400">{`${routeError}`}</pre>
          </>
        )}
        {error && error.message ? (
          <>
            <label htmlFor="message">Error message:</label>
            <pre id="message" className="overflow-auto text-base text-gray-400">{`${error.message}`}</pre>
          </>
        ) : null}
        {error && error.stack ? (
          <>
            <label htmlFor="stack">Stack trace:</label>
            <pre id="stack" className="overflow-auto text-base text-gray-400">{`${error.stack}`}</pre>
          </>
        ) : null}
        {error && !error.message && !error.stack ? (
          <pre className="overflow-auto text-base text-gray-400">{error.toString()}</pre>
        ) : null}
      </details>
    </section>
  );
};

export const IncompleteSiteWarning = () => {
  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold">
        The site you are working on is incomplete. You must complete the site before adding wells.
      </h2>
      <h3 className="mb-2 text-lg font-medium">Site completeness includes</h3>
      <ul className="ml-8 list-decimal">
        <li>The site name, land ownership, and NAICS information must be entered and</li>
        <li>The site address and location must be entered and</li>
        <li>
          At least one of the contacts listed must be the owner, owner/operator, or legal representative of the site.
        </li>
      </ul>
      <div className="mt-6 flex justify-center">
        <BackButton />
      </div>
    </section>
  );
};

export const IncompleteInventoryWarning = ({ siteId, inventoryId, inventoryStatus }) => {
  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold">This inventory is incomplete.</h2>
      <h3 className="mb-2 text-lg font-medium">Inventory completeness includes</h3>
      <ul className="ml-8">
        <li>
          <CheckIcon className="mr-4 inline h-6 w-6 stroke-current text-emerald-500" aria-label="yes" />
          The inventory order number and type and
        </li>
        <li>
          {inventoryStatus?.locationStatus ? (
            <CheckIcon className="mr-4 inline h-6 w-6 stroke-current text-emerald-500" aria-label="yes" />
          ) : (
            <Link to={`/site/${siteId}/inventory/${inventoryId}/add-wells`}>
              <XMarkIcon className="mr-4 inline h-6 w-6 stroke-current text-pink-500" aria-label="no" />
            </Link>
          )}
          The inventory must have at least one well with a location and
        </li>
        <li>
          {inventoryStatus?.detailStatus ? (
            <CheckIcon className="mr-4 inline h-6 w-6 stroke-current text-emerald-500" aria-label="yes" />
          ) : (
            <Link to={`/site/${siteId}/inventory/${inventoryId}/add-well-details`}>
              <XMarkIcon className="mr-4 inline h-6 w-6 stroke-current text-pink-500" aria-label="no" />
            </Link>
          )}
          The well construction types, operating statuses, and well counts must have values{' '}
          {inventoryStatus?.subClass === 5002 && 'and'}
        </li>
        {inventoryStatus?.subClass === 5002 && (
          <li>
            {inventoryStatus.contactStatus ? (
              <CheckIcon className="mr-4 inline h-6 w-6 stroke-current text-emerald-500" aria-label="yes" />
            ) : (
              <Link to={`/site/${siteId}/inventory/${inventoryId}/regulatory-contact`}>
                <XMarkIcon className="mr-4 inline h-6 w-6 stroke-current text-pink-500" aria-label="no" />
              </Link>
            )}
            A regulatory contact must be added.
          </li>
        )}
      </ul>
    </section>
  );
};
