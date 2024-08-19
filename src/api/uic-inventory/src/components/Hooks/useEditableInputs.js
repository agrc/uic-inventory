import { useCallback, useEffect, useState } from 'react';
import { useOpenClosed } from '../Hooks';

const alternateClasses = 'mr-1 rounded-lg border h-6 px-1.5 py-0.5 text-xs hover:bg-red-800 hover:text-white';
const secondaryClasses = 'mx-1 rounded-lg border h-6 px-1.5 py-0.5 text-xs hover:bg-gray-800 hover:text-white';

const getItemByValue = (items, value) => {
  const results = items.filter((type) => type.value === value);

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
    [selected, isEditing, toggle, onMutate],
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
    [toggle],
  );
  const getSelectProps = useCallback(
    (inputProps) => ({
      items,
      selected,
      setSelected,
      ...inputProps,
    }),
    [items, selected, setSelected],
  );

  return { getModifyButtonProps, getCancelButtonProps, isEditing, getSelectProps, label: selected?.label };
};

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
