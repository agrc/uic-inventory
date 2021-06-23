import useNaicsCodes from './useNaicsCodes';
import { ChevronLeftIcon } from '@heroicons/react/solid';
import clsx from 'clsx';
import { useState } from 'react';

const classes =
  'flex items-center justify-center p-4 text-center border border-gray-200 rounded-md cursor-pointer h-32 hover:border-blue-800 hover:border-2 overflow-hidden overflow-ellipsis';

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

function NaicsPicker({ updateWith }) {
  const [code, setCode] = useState();
  const codes = useNaicsCodes(code);

  const back = () => {
    history.pop();
    const length = history.length;
    const index = length - 1;

    if (index > -1) {
      return setCode(history[index]);
    }

    setCode();
  };

  const select = (item) => {
    if (!history.includes(item.code)) {
      history.push(item.code);
    }
    updateWith(item);
    setCode(item.code);
  };

  return (
    <>
      <p className="mb-2 italic text-gray-500">
        For a keyword search and further information about NAICS, please visit the{' '}
        <a type="primary" href="https://census.gov/naics" target="_blank" rel="noopener">
          US Census Bureau NAICS website
        </a>
        .
      </p>
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between flex-1">
          <div>
            <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
                onClick={() => back()}
                disabled={history.length === 0}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
              </button>
              <span
                className={clsx(
                  'relative inline-flex items-center px-4 py-2 text-sm font-medium  bg-white border border-gray-300 hover:bg-gray-50',
                  code?.toString().length === 6 ? 'text-green-500 font-semibold' : 'text-gray-700'
                )}
              >
                {getCodeLevel(code)}
              </span>
              <span
                className={clsx(
                  'relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50',
                  code?.toString().length === 6 ? 'text-green-500 font-semibold' : 'text-gray-700'
                )}
              >
                {code || '?'}
              </span>
            </nav>
          </div>
        </div>
      </div>
      <div className="grid items-stretch grid-cols-2 gap-4 overflow-auto sm:grid-cols-3 md:grid-cols-5">
        {codes?.map((item) => (
          <div key={item.code + item.value} className={classes} onClick={() => select(item)}>
            {item.value}
          </div>
        ))}
      </div>
    </>
  );
}

export default NaicsPicker;
