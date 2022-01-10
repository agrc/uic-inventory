import { useState, useEffect } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { CloudUploadIcon, XIcon, CheckIcon } from '@heroicons/react/outline';
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
        className={clsx('px-2 rounded', className)}
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
      <div className="">
        <div className="flex flex-row">
          <CheckIcon className="w-8 h-8 mx-2 text-emerald-500" />
          <span className="self-center overflow-hidden lowercase truncate whitespace-nowrap">{files[0].name}</span>
        </div>
        <button type="button" meta="default" className="w-full mt-4" onClick={reset}>
          <XIcon className="w-6 h-6 mx-2 text-pink-500" />
          <span className="self-center justify-between">Clear</span>
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
      className={clsx('absolute bottom-0 text-xs right-3', {
        'text-gray-500': percentage >= 0 && percentage < 0.8,
        'text-amber-600': percentage >= 0.8 && percentage < 0.9,
        'text-red-600': percentage >= 0.9,
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
    <section className="grid content-start grid-cols-2" {...getRootProps()}>
      <Label className="col-span-2" id={textarea.id} />
      <section
        className={clsx('relative', {
          hidden: files.length > 0,
          'col-span-2': remaining < limit,
        })}
      >
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
      </section>
      <section
        className={clsx('flex p-2', {
          'bg-gray-50 border-gray-400 border-t border-b border-r rounded-r border-dashed': files.length === 0,
          'bg-white col-span-2': files.length > 0,
          hidden: remaining < limit,
        })}
      >
        <div className={clsx('flex flex-col justify-around grow px-2')}>
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
              forms.reset({ [forms.field.name]: '' });
              setFiles([]);
            }}
          />
          {files.length === 0 && (
            <>
              <button className="items-center pl-0" type="button" meta="default" onClick={open}>
                <CloudUploadIcon className="w-6 h-6 mx-2 text-white" />
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
