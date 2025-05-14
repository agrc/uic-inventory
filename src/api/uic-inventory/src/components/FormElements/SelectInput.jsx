import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { ErrorMessage } from '@hookform/error-message';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import ErrorMessageTag from './ErrorMessage';
import { camelToProper } from './Helpers';

const noop = () => {};

function SelectInput({ register, errors, id, text, items, onUpdate = noop, placeholder = '' }) {
  const { onChange, onBlur, ref, name } = register(id);
  return (
    <div>
      <label htmlFor={id}>{text || camelToProper(id)}</label>
      <select
        id={id}
        name={name}
        ref={ref}
        onChange={(event) => {
          onChange(event);
          onUpdate(event);
        }}
        onBlur={onBlur}
        defaultValue=""
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label || item.value}
          </option>
        ))}
      </select>
      <ErrorMessage errors={errors} name={id} as={ErrorMessageTag} />
    </div>
  );
}

export function SelectListbox({ selected, setSelected, items }) {
  return (
    <div className="w-72">
      <Listbox value={selected} onChange={setSelected}>
        <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
          <span className="block truncate">{selected.label}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <ListboxOptions className="absolute z-10 mt-1 max-h-60 max-w-min overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {items.map((value) => (
              <ListboxOption
                key={value.value}
                className={({ active }) =>
                  clsx('relative cursor-default select-none py-2 pl-10 pr-4', {
                    'bg-gray-700 text-white': active,
                  })
                }
                value={value}
              >
                {({ selected, active }) => (
                  <>
                    <span className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}>{value.label}</span>
                    {selected ? (
                      <span
                        className={clsx('absolute inset-y-0 left-0 flex items-center pl-3', {
                          'text-white': active,
                        })}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </Listbox>
    </div>
  );
}

export default SelectInput;

SelectInput.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.object,
  id: PropTypes.string.isRequired,
  text: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string,
    }),
  ).isRequired,
  onUpdate: PropTypes.func,
  placeholder: PropTypes.string,
};

SelectListbox.propTypes = {
  selected: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string,
  }).isRequired,
  setSelected: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string,
    }),
  ).isRequired,
};
