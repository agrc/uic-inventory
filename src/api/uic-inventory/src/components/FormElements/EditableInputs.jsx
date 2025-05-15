import Tippy from '@tippyjs/react/headless';
import { useOpenClosed } from '@ugrc/utilities/hooks';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Tooltip } from '../PageElements';
import { SelectListbox } from './SelectInput';

const alternateClasses = 'mr-1 rounded-lg border h-6 px-1.5 py-0.5 text-xs hover:bg-red-800 hover:text-white';
const secondaryClasses = 'mx-1 rounded-lg border h-6 px-1.5 py-0.5 text-xs hover:bg-gray-800 hover:text-white';

const getItemByLabel = (items, label) => {
  const results = items.filter((type) => type.label === label);

  return results[0];
};

export const EditableCellSelect = ({ status, wellId, items, onMutate, isValid, tooltip }) => {
  const [isEditing, { toggle }] = useOpenClosed();
  const [error, setError] = useState();
  const otherRef = useRef();
  const [selected, setSelected] = useState(() => {
    return getItemByLabel(items, status);
  });

  useEffect(() => {
    setSelected(getItemByLabel(items, status));
  }, [status, items]);

  return (
    <>
      <span className="flex items-center">
        <button
          onClick={(event) => {
            event.stopPropagation();

            if (isEditing) {
              const data = { status: selected.value, id: wellId, description: otherRef.current?.value };
              setError();

              try {
                isValid(data);
              } catch (error) {
                setError(error.message);

                return;
              }
              onMutate(data);
            }

            toggle();
          }}
          data-style="secondary"
          className={secondaryClasses}
        >
          {isEditing ? 'save' : 'modify'}
        </button>
        {isEditing && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              setSelected(getItemByLabel(items, status));

              toggle();
            }}
            data-style="alternate"
            className={alternateClasses}
          >
            cancel
          </button>
        )}
        {isEditing && <SelectListbox selected={selected} setSelected={setSelected} items={items} />}
        {!isEditing && !tooltip && <span>{selected?.label}</span>}
        {!isEditing && tooltip && (
          <Tippy render={(attrs) => <Tooltip {...attrs}>{tooltip}</Tooltip>}>
            <span className="cursor-help text-blue-800 hover:text-blue-400">{selected?.label}</span>
          </Tippy>
        )}

        {isEditing && selected?.value === 'OT' && (
          <input
            type="text"
            placeholder="description"
            ref={otherRef}
            defaultValue={tooltip}
            className="ml-2 rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none sm:text-sm"
          />
        )}
      </span>
      {error && <div className="m-2 text-xs text-red-500">{error}</div>}
    </>
  );
};

EditableCellSelect.propTypes = {
  status: PropTypes.string.isRequired,
  wellId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onMutate: PropTypes.func.isRequired,
  isValid: PropTypes.func.isRequired,
  tooltip: PropTypes.string,
};
