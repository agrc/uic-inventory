import { useState } from 'react';

function GridHeading({ text, subtext, site, children }) {
  return (
    <div className="md:col-span-1">
      <div className="px-4 sm:px-0">
        <h3 className="text-2xl font-medium leading-6 text-gray-900">{text}</h3>
        <p className="mt-1 text-sm text-gray-600">{subtext}</p>
        <SiteInformation site={site} />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

const SiteInformation = ({ site }) => {
  const [show, setShow] = useState(true);

  return site && show ? (
    <div className="relative mt-4 grid auto-cols-auto gap-1 rounded-lg bg-gray-800 px-4 py-3 text-white shadow md:mt-12">
      <button
        type="button"
        data-style="primary"
        className="absolute right-0 top-0 px-3 py-1"
        onClick={() => setShow(false)}
      >
        x
      </button>
      <div className="col-span-2 text-lg font-medium">Site Information</div>
      <div className="mx-2 font-semibold">Name</div>
      <div className="truncate" title={site?.name}>
        {site?.name ?? 'unknown'}
      </div>
      <div className="mx-2 font-semibold">Id</div>
      <div className="truncate" title={site?.sideId}>
        {(site?.siteId?.length ?? 0) < 1 ? 'unknown' : site.siteId}
      </div>
      <div className="mx-2 font-semibold">Type</div>
      <div className="truncate" title={site?.naicsTitle}>
        {site?.naicsTitle ?? 'unknown'}
      </div>
    </div>
  ) : null;
};

export default GridHeading;
