function GridHeading({ text, subtext, children }) {
  return (
    <div className="md:col-span-1">
      <div className="px-4 sm:px-0">
        <h3 className="text-2xl font-medium leading-6 text-gray-900">{text}</h3>
        <p className="mt-1 text-sm text-gray-600">{subtext}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export default GridHeading;
