function Chrome({ children, title, loading }) {
  return (
    <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div
          className={`${
            loading ? 'min-h-screen md:min-h-profile' : 'h-full'
          } p-4 border-4 border-gray-200 border-dashed rounded-lg`}
        >
          <h1 className="mb-3 text-2xl font-medium">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Chrome;
