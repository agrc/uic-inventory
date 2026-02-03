import { Spinner, useGeocoding } from '@ugrc/utah-design-system';
import { TriangleAlertIcon } from 'lucide-react';
import { Group } from 'react-aria-components';

export const Geocode = (props) => {
  const { getFirstFieldProps, getSecondFieldProps, getButtonProps, found, status } = useGeocoding(props);
  const street = getFirstFieldProps();
  const zone = getSecondFieldProps();
  const find = getButtonProps();

  return (
    <Group className="grid gap-4" aria-label="Geocoding component">
      <div>
        <label htmlFor={street.name}>{street.label}</label>
        <input
          id={street.name}
          name={street.name}
          onKeyUp={(e) => street.onKeyUp(e)}
          onChange={(e) => street.onChange(e.target.value)}
          className="mb-2 mt-1 block w-full rounded border border-gray-400 bg-white px-3 py-2 text-base text-gray-700 focus:border-indigo-500 focus:outline-none"
        />
        {street.isInvalid ? <small className="-mt-2 block text-xs text-red-600">{street.errorMessage}</small> : null}
      </div>
      <div>
        <label htmlFor={zone.name}>{zone.label}</label>
        <input
          id={zone.name}
          name={zone.name}
          onKeyUp={(e) => zone.onKeyUp(e)}
          onChange={(e) => zone.onChange(e.target.value)}
          className="mb-2 mt-1 block w-full rounded border border-gray-400 bg-white px-3 py-2 text-base text-gray-700 focus:border-indigo-500 focus:outline-none"
        />
        {zone.isInvalid ? <small className="-mt-2 block text-xs text-red-600">{zone.errorMessage}</small> : null}
      </div>
      <div>
        <button
          type={find.type}
          data-style={find.variant}
          disabled={find.disabled}
          onClick={find.onPress}
          className="rounded border border-gray-800 bg-white px-3 py-1 text-lg text-black transition duration-200 hover:bg-gray-800 hover:text-white focus:outline-none"
        >
          {(() => {
            if (status === 'idle') {
              return 'Find';
            } else if (status === 'pending') {
              return (
                <span className="flex items-center gap-2">
                  <span className="size-4">
                    <Spinner />
                  </span>
                  <span>Geocoding</span>
                </span>
              );
            } else if (status === 'error') {
              return (
                <span className="flex items-center gap-2">
                  <TriangleAlertIcon className="h-full w-4" />
                  <span>Error</span>
                </span>
              );
            } else if (status === 'success' && !found) {
              return <span>No match</span>;
            } else {
              return (
                <span className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    width="18"
                    height="18"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <span>Match found</span>
                </span>
              );
            }
          })()}
        </button>
      </div>
    </Group>
  );
};
