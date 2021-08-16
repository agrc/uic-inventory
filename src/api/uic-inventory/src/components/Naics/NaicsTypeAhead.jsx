import { useState } from 'react';
import { useCombobox } from 'downshift';
import { ErrorMessage } from '@hookform/error-message';
import { useQuery } from 'react-query';
import ky from 'ky';
import clsx from 'clsx';
import { Label } from '../FormElements/TextInput';
import { onRequestError } from '../PageElements';
import ErrorMessageTag from '../FormElements/ErrorMessage';

function NaicsTypeAhead({ setNaicsCode, id, errors, field }) {
  const [codes, setCodes] = useState([]);
  const { data } = useQuery(['naicsCodes'], () => ky.get(`/api/naics/codes`).json(), {
    staleTime: Infinity,
    onSuccess: (data) => setCodes(data),
    onError: (error) => onRequestError(error, 'We had some trouble finding NAICS codes.'),
  });

  const { isOpen, getMenuProps, getInputProps, getComboboxProps, highlightedIndex, getItemProps } = useCombobox({
    items: codes,
    onSelectedItemChange: (selectedItem) => {
      setNaicsCode(selectedItem.inputValue);
      field.onChange(selectedItem.inputValue);
    },
    onInputValueChange: ({ inputValue }) => {
      if (inputValue?.trim().length === 0) {
        return setCodes(data.slice(0, 15));
      }

      const items = [];
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.toString().startsWith(inputValue)) {
          items.push(item);

          if (items.length === 15) {
            return setCodes(items);
          }
        }
      }

      setCodes(items);
    },
  });

  return (
    <div>
      <Label id={id} text="6-digit NAICS code" />
      <div {...getComboboxProps()}>
        <input id={id} type="text" {...getInputProps({ ...field })} />
      </div>
      <div {...getMenuProps()}>
        {isOpen ? (
          <div className="absolute z-10 w-56 mt-2 overflow-scroll origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg max-h-56 ring-1 ring-black ring-opacity-5 focus:outline-none">
            {codes.length > 0 ? (
              codes.map((item, index) => (
                <div
                  className="px-1 py-1"
                  role="none"
                  // style={highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}}
                  key={`${item}${index}`}
                  {...getItemProps({ item, index })}
                >
                  <button
                    className={clsx('flex items-center w-full px-2 py-2 text-sm text-gray-900 rounded-md group', {
                      'bg-blue-800 text-white': highlightedIndex === index,
                    })}
                  >
                    {item}
                  </button>
                </div>
              ))
            ) : (
              <div className="px-1 py-1" role="none">
                <span className="flex items-center w-56 px-2 py-2 text-sm text-gray-900 rounded-md group">
                  A valid NAICS code is required. Use the Helper Tool to find a code.
                </span>
              </div>
            )}
          </div>
        ) : null}
      </div>
      <ErrorMessage errors={errors} name={id} as={ErrorMessageTag} />
    </div>
  );
}

export default NaicsTypeAhead;
