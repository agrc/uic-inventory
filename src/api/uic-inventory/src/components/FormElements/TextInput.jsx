import ErrorMessageTag from './ErrorMessage';
import { ErrorMessage } from '@hookform/error-message'

const camelToProper = (text) => {
  const parts = text.split(/(?=[A-Z])/);
  const firstWord = `${parts[0].charAt(0).toUpperCase()}${parts[0].slice(1)}`;

  if (parts.length === 1) {
    return firstWord;
  }

  const theRest = parts.slice(1).map(x => x.toLowerCase());

  return `${firstWord} ${theRest.join()}`;
}

function TextInput({ register, errors, id, text, type }) {
  return (<>
    <label htmlFor={id} className="block font-medium text-gray-700">
      {text || camelToProper(id)}
    </label>
    <input type={type || 'text'} id={id} {...register(id)} />
    <ErrorMessage errors={errors} name={id} as={ErrorMessageTag} />
  </>
  );
}

export default TextInput;
