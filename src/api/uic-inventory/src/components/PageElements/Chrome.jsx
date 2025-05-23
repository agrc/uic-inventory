import PropTypes from 'prop-types';
import { ErrorBoundary } from 'react-error-boundary';
import { RouterErrorPage } from '../Pages/ErrorPages';

export default function Chrome({ children, title, loading }) {
  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div
          className={`${
            loading ? 'min-h-screen md:min-h-profile' : 'h-full'
          } rounded-lg border-4 border-dashed border-gray-200 p-4`}
        >
          {title && <h1 className="mb-3 text-2xl font-medium">{title}</h1>}
          <ErrorBoundary FallbackComponent={RouterErrorPage}>{children}</ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

Chrome.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  loading: PropTypes.bool,
};
