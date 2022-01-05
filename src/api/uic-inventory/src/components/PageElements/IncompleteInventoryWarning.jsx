import { CheckIcon, LocationMarkerIcon, UsersIcon, XIcon } from '@heroicons/react/solid';
import { Link } from '../PageElements';

export default function IncompleteInventoryWarning({ siteId, inventoryId, inventoryStatus }) {
  return (
    <section>
      <h2 className="mb-6 text-xl font-semibold text-center">This inventory is incomplete.</h2>
      <h3 className="mb-2 text-lg font-medium">Inventory completeness includes</h3>
      <ul className="ml-8">
        <li>
          <CheckIcon className="inline w-6 h-6 mr-4 stroke-current text-emerald-500" aria-label="yes" />
          The inventory order number and type and
        </li>
        <li>
          {inventoryStatus?.locationStatus ? (
            <CheckIcon className="inline w-6 h-6 mr-4 stroke-current text-emerald-500" aria-label="yes" />
          ) : (
            <Link to={`/site/${siteId}/inventory/${inventoryId}/add-wells`}>
              <XIcon className="inline w-6 h-6 mr-4 text-pink-500 stroke-current" aria-label="no" />
            </Link>
          )}
          The inventory must have at least one well with a location and
        </li>
        <li>
          {inventoryStatus?.detailStatus ? (
            <CheckIcon className="inline w-6 h-6 mr-4 stroke-current text-emerald-500" aria-label="yes" />
          ) : (
            <Link to={`/site/${siteId}/inventory/${inventoryId}/add-well-details`}>
              <XIcon className="inline w-6 h-6 mr-4 text-pink-500 stroke-current" aria-label="no" />
            </Link>
          )}
          The well construction types, operating statuses, and well counts must have values{' '}
          {inventoryStatus?.subClass === 5002 && 'and'}
        </li>
        {inventoryStatus?.subClass === 5002 && (
          <li>
            {inventoryStatus.contactStatus ? (
              <CheckIcon className="inline w-6 h-6 mr-4 stroke-current text-emerald-500" aria-label="yes" />
            ) : (
              <Link to={`/site/${siteId}/inventory/${inventoryId}/regulatory-contact`}>
                <XIcon className="inline w-6 h-6 mr-4 text-pink-500 stroke-current" aria-label="no" />
              </Link>
            )}
            A regulatory contact must be added.
          </li>
        )}
      </ul>
    </section>
  );
}

const test = ({ data, siteId, inventoryId }) => {
  return (
    <>
      <h1>This inventory is incomplete and not ready to be submitted.</h1>
      <section className="flex flex-col m-6">
        <Link
          to={`/site/${siteId}/inventory/${inventoryId}/regulatory-contact`}
          className="relative inline-block w-6 h-6 text-gray-500 hover:text-blue-800"
        >
          <UsersIcon className="inline w-6 h-6 mr-4 top-2" aria-label="regulatory contacts" />
          {data.contactStatus ? (
            <CheckIcon className="inline w-6 h-6 mr-4 stroke-current text-emerald-500" aria-label="yes" />
          ) : (
            <XIcon className="inline w-6 h-6 mr-4 text-pink-500 stroke-current" aria-label="no" />
          )}
        </Link>
        <Link
          to={`/site/${siteId}/inventory/${inventoryId}/add-wells`}
          className="relative inline-block w-6 h-6 text-gray-500 hover:text-blue-800"
        >
          <LocationMarkerIcon className="inline w-6 h-6 mr-4 top-2" aria-label="well locations" />
          {data.locationStatus ? (
            <CheckIcon className="inline w-6 h-6 mr-4 stroke-current text-emerald-500" aria-label="yes" />
          ) : (
            <XIcon className="inline w-6 h-6 mr-4 text-pink-500 stroke-current" aria-label="no" />
          )}
        </Link>
        <Link
          to={`/site/${siteId}/inventory/${inventoryId}/add-wells`}
          className="relative inline-block w-6 h-6 text-gray-500 hover:text-blue-800"
        >
          <LocationMarkerIcon className="inline w-6 h-6 mr-4 top-2" aria-label="well locations" />
          {data.detailStatus ? (
            <CheckIcon className="inline w-6 h-6 mr-4 stroke-current text-emerald-500" aria-label="yes" />
          ) : (
            <XIcon className="inline w-6 h-6 mr-4 text-pink-500 stroke-current" aria-label="no" />
          )}
        </Link>
      </section>
    </>
  );
};
