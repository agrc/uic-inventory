import { useState, useEffect } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { CloudArrowUpIcon, XIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
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
  rows: PropTypes.string,
  /**
   * The character count limit
   */
  limit: PropTypes.number.isRequired,
  /**
   * The ref property for use with registering with react hook form
   */
  inputRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  /**
   * The function to execute when the text area value changes
   */
  onChange: PropTypes.func,
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

export const useMaxLength = ({ value, limit }) => {
  return {
    limit,
    remaining: limit - (value?.length || 0),
  };
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
        <button type="button" data-meta="default" className="mt-4 w-full" onClick={reset}>
          <XIcon className="mx-2 h-6 w-6 text-pink-500" />
          <span className="justify-between self-center">Clear</span>
        </button>
      </div>
    );
  }

  return <p className="self-center text-center">Drag a file here or</p>;
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

const acceptableFileTypes = ['.pdf', '.doc', '.docx', '.jpeg', '.jpg', '.png'];

export const LimitedDropzone = ({ textarea, forms }) => {
  const [files, setFiles] = useState([]);
  const { limit, remaining } = useMaxLength({ value: forms.field.value, limit: textarea.limit });
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: false,
    maxFiles: 1,
    accept: acceptableFileTypes.join(),
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
      <Label className="col-span-2" id={textarea.id} />
      <section
        className={clsx('relative', {
          hidden: files.length > 0,
          'col-span-2': remaining < limit,
        })}
      >
        <div className="relative">
          <textarea
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
            data-meta="default"
            className="mt-4 w-full"
            onClick={() => forms.reset({ ...forms.getValues(), [textarea.id]: '' }, { keepDefaultValues: true })}
          >
            <XIcon className="mx-2 h-6 w-6 text-pink-500" />
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
              <button className="items-center pl-0" type="button" data-meta="default" onClick={open}>
                <CloudArrowUpIcon className="mx-2 h-6 w-6 text-white" />
                Pick a file
              </button>
              <div className="self-center text-sm text-gray-600">(pdf, doc, docx, jpg, jpeg, png)</div>
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
