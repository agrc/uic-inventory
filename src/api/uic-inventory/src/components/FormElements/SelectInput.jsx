import ErrorMessageTag from './ErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import { camelToProper } from './Helpers';

function SelectInput({ register, errors, id, text, items, placeholder = '' }) {
  return (
    <>
      <label htmlFor={id} className="">
        {text || camelToProper(id)}
      </label>
      <select id={id} {...register(id)}>
        <option value="" disabled selected hidden>
          {placeholder}
        </option>
        {items.map((item) => (
          <option value={item.value}>{item.label || item.value}</option>
        ))}
      </select>
      <ErrorMessage errors={errors} name={id} as={ErrorMessageTag} />
    </>
  );
}

export default SelectInput;
