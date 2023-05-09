import { useCallback, useEffect, useRef, useState } from 'react';
import { useOpenClosed } from '../Hooks';
import { SelectListbox } from './SelectInput';

const alternateClasses = 'mr-1 rounded-lg border h-6 px-1.5 py-0.5 text-xs hover:bg-red-800 hover:text-white';
const secondaryClasses =
  'mx-1 rounded-lg border h-6 px-1.5 py-0.5 text-xs hover:bg-gray-800 hover:text-white print:hidden';
export const useEditableInput = (value, onMutate) => {
  const [isEditing, { toggle }] = useOpenClosed();
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (isEditing) {
      setNewValue(value ?? '');
    }
  }, [isEditing, value]);

  const getModifyButtonProps = (inputProps) => {
    return {
      children: isEditing ? 'save' : 'modify',
      onClick: () => {
        if (isEditing) {
          onMutate(newValue);
        }

        toggle();
      },
      'data-style': 'secondary',
      className: secondaryClasses,
      ...inputProps,
    };
  };
  const getCancelButtonProps = (inputProps) => {
    return {
      children: 'cancel',
      onClick: toggle,
      'data-style': 'alternate',
      className: alternateClasses,
      ...inputProps,
    };
  };
  const getInputProps = (inputProps) => {
    return {
      type: 'text',
      value: newValue,
      onChange: (event) => setNewValue(event.target.value),
      ...inputProps,
    };
  };

  return { getModifyButtonProps, getCancelButtonProps, isEditing, getInputProps };
};

const getItemByValue = (items, value) => {
  const results = items.filter((type) => type.value === value);

  return results[0];
};

const getItemByLabel = (items, label) => {
  const results = items.filter((type) => type.label === label);

  return results[0];
};

export const useEditableSelect = (value, items, onMutate) => {
  const [isEditing, { toggle }] = useOpenClosed();
  const [selected, setSelected] = useState(() => {
    return getItemByValue(items, value);
  });

  useEffect(() => {
    setSelected(getItemByValue(items, value));
  }, [value, items]);

  const getModifyButtonProps = useCallback(
    (inputProps) => ({
      children: isEditing ? 'save' : 'modify',
      onClick: (event) => {
        event.stopPropagation();

        if (isEditing) {
          onMutate(selected);
        }

        toggle();
      },
      'data-style': 'secondary',
      className: secondaryClasses,
      ...inputProps,
    }),
    [selected, isEditing, toggle, onMutate]
  );
  const getCancelButtonProps = useCallback(
    (inputProps) => ({
      children: 'cancel',
      onClick: (event) => {
        event.stopPropagation();

        toggle();
      },
      'data-style': 'alternate',
      className: alternateClasses,
      ...inputProps,
    }),
    [toggle]
  );
  const getSelectProps = useCallback(
    (inputProps) => ({
      items,
      selected,
      setSelected,
      ...inputProps,
    }),
    [items, selected, setSelected]
  );

  return { getModifyButtonProps, getCancelButtonProps, isEditing, getSelectProps, label: selected?.label };
};

export const EditableCellSelect = ({ status, wellId, items, onMutate, isValid }) => {
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

              toggle();
            }}
            data-style="alternate"
            className={alternateClasses}
          >
            cancel
          </button>
        )}
        {isEditing ? (
          <SelectListbox selected={selected} setSelected={setSelected} items={items} />
        ) : (
          <span>{selected?.label}</span>
        )}
        {isEditing && selected?.value === 'OT' && (
          <input
            type="text"
            placeholder="description"
            ref={otherRef}
            className="ml-2 rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none sm:text-sm"
          />
        )}
      </span>
      {error && <div className="m-2 text-xs text-red-500">{error}</div>}
    </>
  );
};
