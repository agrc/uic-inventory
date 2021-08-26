import ErrorMessageTag from './ErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import { camelToProper } from './Helpers';

const noop = () => {};

function SelectInput({ register, errors, id, text, items, onUpdate = noop, placeholder = '' }) {
  const { onChange, onBlur, ref, name } = register(id);
  return (
    <div>
      <label htmlFor={id} className="">
        {text || camelToProper(id)}
      </label>
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

export default SelectInput;
