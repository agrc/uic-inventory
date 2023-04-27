import { ErrorMessage } from '@hookform/error-message';
import clsx from 'clsx';
import ErrorMessageTag from './ErrorMessage';
import { camelToProper } from './Helpers';

function TextInput({ className, register, errors, id, text, type, readOnly = false }) {
  return (
    <div>
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
    </div>
  );
}

export const Label = ({ id, text, className, children }) => (
  <label htmlFor={id} className={clsx(className, 'flex space-x-1 font-medium text-gray-700')}>
    <span>{text || camelToProper(id)}</span>
    <span>{children}</span>
  </label>
);

export default TextInput;
