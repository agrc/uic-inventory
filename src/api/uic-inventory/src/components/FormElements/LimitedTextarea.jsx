import { CheckIcon, CloudArrowUpIcon, QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ErrorMessage } from '@hookform/error-message';
import Tippy from '@tippyjs/react/headless';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { useMaxLength } from '../Hooks';
import { Tooltip } from '../PageElements';
import ErrorMessageTag from './ErrorMessage';
import { Label } from './TextInput';

export const LimitedTextarea = ({ rows, placeholder, value, maxLength, field, errors, className, disabled }) => {
  const { limit, remaining } = useMaxLength({ value: field.value, limit: maxLength });

  return (
    <div className="relative flex grow">
      <textarea
        disabled={disabled}
        id={field.name}
        rows={rows.toString()}
        type="textarea"
        defaultValue={value}
        maxLength={limit}
        placeholder={placeholder}
        className={clsx('rounded px-2', className)}
        {...field}
      ></textarea>
      <CharactersRemaining limit={limit} remaining={remaining} />
      <ErrorMessage errors={errors} name={name} as={ErrorMessageTag} />
    </div>
  );
};

LimitedTextarea.propTypes = {
  /**
   * The property name used by react hook form
   */
  name: PropTypes.string,
  /**
   * The help text to display
   */
  placeholder: PropTypes.string,
  /**
   * The value to preset the input to
   */
  value: PropTypes.string,
  /**
   * The number of rows to have in the textarea
   */
  rows: PropTypes.number,
  /**
   * The character count limit
   */
  maxLength: PropTypes.number.isRequired,
  /**
   * The field object provided by react hook form
   */
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
  }).isRequired,
  /**
   * The errors object provided by react hook form
   */
  errors: PropTypes.object,
  /**
   * Additional class names for styling
   */
  className: PropTypes.string,
  /**
   * Whether the textarea is disabled
   */
  disabled: PropTypes.bool,
};

LimitedTextarea.defaultProps = {
  name: null,
  placeholder: null,
  value: '',
  rows: 3,
  limit: 500,
  inputRef: null,
  onChange: undefined,
  disabled: false,
};

export const DropzoneMessaging = ({ isDragActive, files = [], reset = () => {} }) => {
  if (isDragActive) {
    return <p className="self-center">Ok, drop it!</p>;
  }

  if (files.length > 0) {
    return (
      <div>
        <div className="flex flex-row">
          <CheckIcon className="mx-2 h-8 w-8 text-emerald-500" />
          <span className="self-center overflow-hidden truncate whitespace-nowrap lowercase">{files[0].name}</span>
        </div>
        <button type="button" data-style="primary" className="mt-4 w-full" onClick={reset}>
          <XMarkIcon className="mx-2 h-6 w-6 text-pink-500" />
          <span className="justify-between self-center">Clear</span>
        </button>
      </div>
    );
  }

  return <p className="self-center text-center">Drag a PDF here or</p>;
};

export const CharactersRemaining = ({ remaining, limit }) => {
  if (remaining === limit) {
    return null;
  }

  const percentage = (limit - remaining) / limit;

  return (
    <span
      className={clsx('absolute bottom-0 right-3', {
        'text-xs text-gray-500': percentage >= 0 && percentage < 0.8,
        'text-xs text-amber-600': percentage >= 0.8 && percentage < 0.9,
        'border border-red-600 bg-white p-2 text-lg font-black text-red-600': percentage >= 0.9,
      })}
    >
      {remaining} characters left
    </span>
  );
};

export const LimitedDropzone = ({ textarea, forms, helpText }) => {
  const [files, setFiles] = useState([]);
  const { limit, remaining } = useMaxLength({ value: forms.field.value, limit: textarea.limit });
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: false,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
    },
    onDropRejected: () => {
      toast.error('File type not accepted');
    },
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      forms.setValue(forms.field.name, acceptedFiles[0], { shouldValidate: true, shouldDirty: true });
    },
  });

  useEffect(() => {
    if (forms.formState.isSubmitSuccessful) {
      setFiles([]);
    }
  }, [forms.formState.isSubmitSuccessful]);

  return (
    <section className="grid grid-cols-2 content-start" {...getRootProps()}>
      <Label className="col-span-2" id={textarea.id}>
        {helpText && (
          <Tippy render={(attrs) => <Tooltip {...attrs}>{helpText}</Tooltip>}>
            <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600" />
          </Tippy>
        )}
      </Label>
      <section
        className={clsx('relative', {
          hidden: files.length > 0,
          'col-span-2': remaining < limit,
        })}
      >
        <div className="relative">
          <textarea
            id={textarea.id}
            className={clsx('px-2', {
              'rounded-l': remaining === limit,
              rounded: remaining < limit,
            })}
            rows={textarea.rows}
            disabled={textarea.disabled}
            type="textarea"
            placeholder={textarea.placeholder}
            defaultValue={textarea.value}
            maxLength={limit}
            {...(files.length >= 1 ? {} : forms.field)}
          />
          <CharactersRemaining limit={limit} remaining={remaining} />
        </div>
        {remaining < limit && (
          <button
            type="button"
            data-style="secondary"
            className="mt-4 w-full"
            onClick={() => forms.reset({ ...forms.getValues(), [textarea.id]: '' }, { keepDefaultValues: true })}
          >
            <XMarkIcon className="mx-2 h-6 w-6 text-pink-200" />
            <span className="justify-between self-center">Clear</span>
          </button>
        )}
      </section>
      <section
        className={clsx('flex p-2', {
          'rounded-r border-b border-r border-t border-dashed border-gray-400 bg-gray-50': files.length === 0,
          'col-span-2 bg-white': files.length > 0,
          hidden: remaining < limit,
        })}
      >
        <div className={clsx('flex grow flex-col justify-around px-2')}>
          <input
            {...(files.length > 0 ? forms.field : {})}
            {...getInputProps({
              'aria-label': 'Upload PDF file',
              onChange: (e) => {
                forms.field.onChange(e.target.files[0]);
              },
            })}
            value=""
          />
          <DropzoneMessaging
            isDragActive={isDragActive}
            files={files}
            reset={() => {
              forms.reset({ ...forms.getValues(), [forms.field.name]: '' });
              setFiles([]);
            }}
          />
          {files.length === 0 && (
            <>
              <button className="items-center pl-0" type="button" data-style="secondary" onClick={open}>
                <CloudArrowUpIcon className="mx-2 h-6 w-6 text-white" />
                Pick a PDF
              </button>
              <div className="self-center text-sm text-gray-600">(pdf&apos;s only)</div>
            </>
          )}
        </div>
      </section>
      <div className="col-span-2">
        <ErrorMessage
          errors={{ [forms.field.name]: forms?.fieldState?.error }}
          name={forms.field.name}
          as={ErrorMessageTag}
        />
      </div>
    </section>
  );
};

export { useMaxLength };

CharactersRemaining.propTypes = {
  /**
   * The number of remaining characters
   */
  remaining: PropTypes.number.isRequired,
  /**
   * The character limit
   */
  limit: PropTypes.number.isRequired,
};

DropzoneMessaging.propTypes = {
  /**
   * Whether a file is being dragged over the dropzone
   */
  isDragActive: PropTypes.bool.isRequired,
  /**
   * The list of files currently in the dropzone
   */
  files: PropTypes.arrayOf(PropTypes.object),
  /**
   * Function to reset the dropzone
   */
  reset: PropTypes.func,
};

DropzoneMessaging.defaultProps = {
  files: [],
  reset: () => {},
};

LimitedDropzone.propTypes = {
  /**
   * The textarea configuration
   */
  textarea: PropTypes.shape({
    id: PropTypes.string.isRequired,
    rows: PropTypes.number,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    limit: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
  }).isRequired,
  /**
   * The forms object provided by react hook form
   */
  forms: PropTypes.shape({
    field: PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.any,
      onChange: PropTypes.func.isRequired,
      onBlur: PropTypes.func.isRequired,
    }).isRequired,
    setValue: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    getValues: PropTypes.func.isRequired,
    formState: PropTypes.shape({
      isSubmitSuccessful: PropTypes.bool.isRequired,
    }).isRequired,
    fieldState: PropTypes.shape({
      error: PropTypes.object,
    }),
  }).isRequired,
  /**
   * The help text to display
   */
  helpText: PropTypes.string,
};

LimitedDropzone.defaultProps = {
  helpText: null,
};
