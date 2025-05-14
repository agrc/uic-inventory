import PropTypes from 'prop-types';

const ErrorMessageTag = ({ children }) => (
  <p className="m-auto w-3/4 rounded rounded-t-none border-2 border-t-0 border-red-300 bg-gray-50 py-1 text-center font-semibold text-gray-600 shadow">
    {children}
  </p>
);

export default ErrorMessageTag;

ErrorMessageTag.propTypes = {
  children: PropTypes.node.isRequired,
};
