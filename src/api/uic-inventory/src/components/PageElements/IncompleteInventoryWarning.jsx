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
