import {
  LimitedTextarea,
  LimitedTextareaFileInput,
  useMaxLength,
  LimitedDropzone,
  DropzoneMessaging,
} from './LimitedTextarea';

export default {
  title: 'FormElements/Limited Textarea',
  component: LimitedTextarea,
};

export const Default = () => <LimitedTextarea limit={500} rows="5" register={() => {}} errors={{ errors: {} }} />;
export const FileInputDefault = () => <LimitedTextareaFileInput />;
export const WithMaxLengthHook = () => {
  const { limit, change, remaining } = useMaxLength({ limit: 20 });
  return (
    <>
      <textarea rows="5" maxLength={limit} onChange={change} />
      {remaining !== limit && <span>{remaining}</span>}
    </>
  );
};
export const LimitedDragAndDrop = () => (
  <LimitedDropzone
    textarea={{
      id: 'testName',
      limit: 25,
      rows: 5,
      placeholder: 'Type your response or upload a file',
    }}
    forms={{
      errors: {},
      register: () => {},
    }}
    file={{
      id: 'testNameFile',
    }}
  />
);
export const AcceptedFiles = () => (
  <DropzoneMessaging acceptedFiles={[{ name: 'some really long filename version-1.final.JPEG' }]} />
);
