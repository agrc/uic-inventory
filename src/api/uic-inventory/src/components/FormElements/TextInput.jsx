import { ErrorMessage } from '@hookform/error-message';
import ErrorMessageTag from './ErrorMessage';
import { camelToProper } from './Helpers';

function TextInput({ className, register, errors, id, text, type, readOnly = false }) {
  return (
    <>
      <Label id={id} text={text} />
      <input
        type={type || 'text'}
        id={id}
        className={className}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : null}
        {...register(id)}
      />

      <ErrorMessage errors={errors} name={id} as={ErrorMessageTag} />
    </>
  );
}

export const Label = ({ id, text }) => (
  <label htmlFor={id} className="block font-medium text-gray-700">
    {text || camelToProper(id)}
  </label>
);

export default TextInput;
