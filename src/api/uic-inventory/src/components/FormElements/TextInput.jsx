import ErrorMessageTag from './ErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import { camelToProper } from './Helpers';

function TextInput({ register, errors, id, text, type }) {
  return (
    <>
      <label htmlFor={id} className="block font-medium text-gray-700">
        {text || camelToProper(id)}
      </label>
      <input type={type || 'text'} id={id} {...register(id)} />
      <ErrorMessage errors={errors} name={id} as={ErrorMessageTag} />
    </>
  );
}

export default TextInput;
