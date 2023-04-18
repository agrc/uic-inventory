import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Link } from '../PageElements';

export default function IncompleteInventoryWarning({ siteId, inventoryId, inventoryStatus }) {
  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold">This inventory is incomplete.</h2>
      <h3 className="mb-2 text-lg font-medium">Inventory completeness includes</h3>
      <ul className="ml-8">
        <li>
          <CheckIcon className="mr-4 inline h-6 w-6 stroke-current text-emerald-500" aria-label="yes" />
          The inventory order number and type and
        </li>
        <li>
          {inventoryStatus?.locationStatus ? (
            <CheckIcon className="mr-4 inline h-6 w-6 stroke-current text-emerald-500" aria-label="yes" />
          ) : (
            <Link to={`/site/${siteId}/inventory/${inventoryId}/add-wells`}>
              <XMarkIcon className="mr-4 inline h-6 w-6 stroke-current text-pink-500" aria-label="no" />
            </Link>
          )}
          The inventory must have at least one well with a location and
        </li>
        <li>
          {inventoryStatus?.detailStatus ? (
            <CheckIcon className="mr-4 inline h-6 w-6 stroke-current text-emerald-500" aria-label="yes" />
          ) : (
            <Link to={`/site/${siteId}/inventory/${inventoryId}/add-well-details`}>
              <XMarkIcon className="mr-4 inline h-6 w-6 stroke-current text-pink-500" aria-label="no" />
            </Link>
          )}
          The well construction types, operating statuses, and well counts must have values{' '}
          {inventoryStatus?.subClass === 5002 && 'and'}
        </li>
        {inventoryStatus?.subClass === 5002 && (
          <li>
            {inventoryStatus.contactStatus ? (
              <CheckIcon className="mr-4 inline h-6 w-6 stroke-current text-emerald-500" aria-label="yes" />
            ) : (
              <Link to={`/site/${siteId}/inventory/${inventoryId}/regulatory-contact`}>
                <XMarkIcon className="mr-4 inline h-6 w-6 stroke-current text-pink-500" aria-label="no" />
              </Link>
            )}
            A regulatory contact must be added.
          </li>
        )}
      </ul>
    </section>
  );
}
