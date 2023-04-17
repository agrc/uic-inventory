import { useState } from 'react';
import useNaicsCodes from './useNaicsCodes';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

const getCodeLevel = (code) => {
  if (!code || code?.length < 2) {
    return 'Sector';
  }

  code = code.toString();

  if (code.length === 2 || code.indexOf('-') > -1) {
    return 'Sector';
  }

  switch (code.length) {
    case 3:
      return 'Subsector';
    case 4:
      return 'Industry Group';
    case 5:
      return 'NAICS Industry';
    case 6:
      return 'National Industry';
    default:
      return 'Sector';
  }
};

const history = [];

export default function NaicsPicker({ updateWith }) {
  const [code, setCode] = useState(undefined);
  const [codes, isPreviousData] = useNaicsCodes(code);
  const [selectedItem, setSelectedItem] = useState(undefined);

  let classes =
    'flex items-center justify-center p-4 text-center border border-gray-200 rounded-md h-32 cursor-pointer hover:border-blue-800 hover:border-2 overflow-hidden text-ellipsis disabled:cursor-wait disabled:filter disabled:blur-xs';

  const back = () => {
    history.pop();
    const length = history.length;
    const index = length - 1;

    if (index > -1) {
      return setCode(history[index]);
    }

    setCode(undefined);
  };

  const select = (item) => {
    if (isPreviousData) {
      return;
    }

    if (!history.includes(item.code)) {
      history.push(item.code);
    }

    updateWith(item);
    setCode(item.code);
    setSelectedItem(`${item.code}${item.value}`);
  };

  return (
    <>
      <p className="mb-2 italic text-gray-500">
        For a keyword search and further information about NAICS, please visit the{' '}
        <a meta="primary" href="https://census.gov/naics" target="_blank" rel="noopener noreferrer">
          US Census Bureau NAICS website
        </a>
        .
      </p>
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 items-center justify-between">
          <div>
            <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                onClick={() => back()}
                disabled={history.length === 0}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <span
                className={clsx(
                  'relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50',
                  code?.toString().length === 6 ? 'font-semibold text-emerald-500' : 'text-gray-700'
                )}
              >
                {getCodeLevel(code)}
              </span>
              <span
                className={clsx(
                  'relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50',
                  code?.toString().length === 6 ? 'font-semibold text-emerald-500' : 'text-gray-700'
                )}
              >
                {code || '?'}
              </span>
            </nav>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 items-stretch gap-4 overflow-auto sm:grid-cols-3 md:grid-cols-5">
        {codes?.map((item) => (
          <button
            key={item.code + item.value}
            className={clsx(classes, { 'border-blue-500 bg-blue-100': item.code + item.value === selectedItem })}
            disabled={isPreviousData}
            onClick={() => select(item)}
          >
            {item.value}
          </button>
        ))}
      </div>
    </>
  );
}
