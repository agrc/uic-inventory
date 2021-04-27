const ErrorMessageTag = ({ children }) => (
  <p className="w-3/4 py-1 m-auto font-semibold text-center text-gray-600 border-2 border-t-0 border-red-300 rounded rounded-t-none shadow bg-gray-50">
    {children}
  </p>
);

export default ErrorMessageTag;
