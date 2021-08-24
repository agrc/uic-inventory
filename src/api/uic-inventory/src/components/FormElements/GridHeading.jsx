function GridHeading({ text, subtext, site, children }) {
  return (
    <div className="md:col-span-1">
      <div className="px-4 sm:px-0">
        <h3 className="text-2xl font-medium leading-6 text-gray-900">{text}</h3>
        <p className="mt-1 text-sm text-gray-600">{subtext}</p>
        {site && (
          <div className="grid gap-1 px-4 py-3 mt-4 text-white bg-gray-800 rounded-lg shadow md:mt-12 auto-cols-auto">
            <div className="col-span-2 text-lg font-medium ">Site Information</div>
            <div className="mx-2 font-semibold">Name</div>
            <div className="truncate" title={site?.name}>
              {site?.name ?? 'Unknown'}
            </div>
            <div className="mx-2 font-semibold">Type</div>
            <div className="truncate" title={site?.title}>
              {site?.title ?? 'Unknown'}
            </div>
          </div>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export default GridHeading;
