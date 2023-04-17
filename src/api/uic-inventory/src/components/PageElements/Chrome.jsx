import { ErrorBoundary } from 'react-error-boundary';
import { Link, useNavigate } from '../PageElements';

const RouterErrorPage = ({ error }) => {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="mb-1 text-2xl font-medium text-gray-700">This is a little embarrassing...</h2>
      <p>
        We are really sorry. There was an error in the application that caused it to crash. You may now{' '}
        <button data-meta="primary" onClick={() => navigate(-1)}>
          go back
        </button>{' '}
        to the previous page and try again or{' '}
        <Link data-meta="primary" to="/contact" replace={true}>
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

function Chrome({ children, title, loading }) {
  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div
          className={`${
            loading ? 'min-h-screen md:min-h-profile' : 'h-full'
          } rounded-lg border-4 border-dashed border-gray-200 p-4 print:border-none`}
        >
          {title && <h1 className="mb-3 text-2xl font-medium">{title}</h1>}
          <ErrorBoundary FallbackComponent={RouterErrorPage}>{children}</ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default Chrome;
