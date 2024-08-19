import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import ky from 'ky';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { Facebook } from 'react-content-loader';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../../AuthProvider';
import {
  DropzoneMessaging,
  ErrorMessageTag,
  FormGrid,
  Label,
  PageGrid,
  ResponsiveGridColumn,
  InventorySubmissionSchema as schema,
} from '../../FormElements';
import { Chrome, onRequestError, toast, useNavigate, useParams } from '../../PageElements';
import { IncompleteInventoryWarning } from '../ErrorPages';
import { getInventory } from '../loaders';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric',
  hour12: true,
  hour: 'numeric',
  minute: 'numeric',
});

export function Component() {
  const { siteId, inventoryId } = useParams();

  const { status, data, error } = useQuery(getInventory(siteId, inventoryId));

  return (
    <main>
      <Chrome loading={status === 'pending'}>
        <PageStatus status={status} data={data} error={error} />
      </Chrome>
    </main>
  );
}

const PageStatus = ({ status, data, error }) => {
  const { siteId, inventoryId } = useParams();

  if (status === 'pending') {
    return <Facebook />;
  }

  if (status === 'success') {
    if (data?.status === 404) {
      return <h1>Inventory does not existing</h1>;
    }

    if (data.signature && data.signatureStatus) {
      return <AlreadySubmitted data={data} />;
    }

    const success = [data.detailStatus, data.locationStatus];
    if (data.wellClass === 5002) {
      success.push(data.contactStatus);
    }

    if (success.every((x) => x)) {
      return <SubmissionForm data={data} />;
    } else {
      return (
        <PageGrid
          heading="Sign and Submit Inventory"
          submit={true}
          disabled={true}
          back={true}
          submitLabel="Submit"
          site={data?.site}
        >
          <IncompleteInventoryWarning siteId={siteId} inventoryId={inventoryId} inventoryStatus={data} />
        </PageGrid>
      );
    }
  }

  if (error?.response?.status === 404) {
    return <h1>This inventory does not exist for this site.</h1>;
  }

  return <h1>Something went terribly wrong</h1>;
};
PageStatus.propTypes = {
  status: PropTypes.string,
  error: PropTypes.object,
  data: PropTypes.object,
};
const SubmissionForm = ({ data }) => {
  const { authInfo } = useContext(AuthContext);

  const { siteId, inventoryId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const queryClient = useQueryClient();

  const { status, mutate } = useMutation({
    mutationFn: (data) => ky.post('/api/inventory/submit', { json: { ...data, id: authInfo.id, siteId, inventoryId } }),
    onSuccess: () => {
      toast.success('Inventory submitted successfully!');
      navigate('/');
      queryClient.invalidateQueries({ queryKey: ['site', siteId, 'inventory', inventoryId] });
    },
    onError: (error) => onRequestError(error, 'We had some trouble submitting this inventory.'),
  });

  const { formState, register, setValue, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      signature: '',
    },
  });
  const { isDirty, isSubmitSuccessful } = formState;

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
      setValue('signature', acceptedFiles[0], { shouldValidate: true, shouldDirty: true });
    },
  });

  // reset form after successful submission
  useEffect(() => {
    if (isSubmitSuccessful) {
      setFiles([]);
    }
  }, [isSubmitSuccessful]);

  const submitInventory = (data) => {
    console.log('submitting', data);
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(submitInventory)}>
      <PageGrid
        heading="Sign and Submit Inventory"
        subtext={`In accordance with Section R317-7-6.4(C) of the Utah Administrative Rules for the Underground
         Injection Control Program, providing a signature other than the owner, operator, or legal representative -
         and/or submitting an application with insufficient information - may result in the rejection of the application.
         Rejected applications will be removed from the system and will need to be resubmitted with complete
         information to be considered for review.`}
        submit={true}
        disabled={!isDirty}
        back={true}
        submitLabel="Submit"
        site={data?.site}
        status={status}
      >
        <FormGrid>
          <ResponsiveGridColumn full={true}>
            This UIC Inventory Information Form must be signed by the <strong>owner</strong>, <strong>operator</strong>,
            or <strong>legal representative</strong> of the injection well(s) for which the inventory information is
            being submitted. Please use the{' '}
            <a
              data-style="link"
              href="https://drive.google.com/file/d/1LXQ_gYYbqQrljmiEM9vPwEfMulGopkWl/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              UIC Inventory Submission Signature Template
            </a>{' '}
            to upload a copy of the <strong>owner</strong>, <strong>operator</strong>, or{' '}
            <strong>legal representative&apos;s</strong> signature in the file submission box below.
          </ResponsiveGridColumn>
          <ResponsiveGridColumn full={true}>
            <div>Effective date of submission: {new Date().toLocaleDateString()}</div>
          </ResponsiveGridColumn>
          <ResponsiveGridColumn full={true}>
            <Label id="signature" text="Signature form:" />
          </ResponsiveGridColumn>
          <ResponsiveGridColumn full={true}>
            <section
              {...getRootProps()}
              className={clsx('mx-auto flex p-2 lg:w-3/4', {
                'rounded border border-dashed border-gray-400 bg-gray-50': files.length === 0,
                'col-span-2 bg-white': files.length > 0,
              })}
            >
              <div className={clsx('flex grow flex-col justify-around px-2')}>
                <input id="signature" {...register('signature', { required: true })} {...getInputProps()} value="" />
                <DropzoneMessaging
                  isDragActive={isDragActive}
                  files={files}
                  reset={() => {
                    reset({ signature: '' });
                    setFiles([]);
                  }}
                />
                {files.length === 0 && (
                  <>
                    <button className="items-center pl-0" type="button" data-style="secondary" onClick={open}>
                      <CloudArrowUpIcon className="mx-2 h-6 w-6 text-white" />
                      Upload signature template
                    </button>
                    <div className="self-center text-sm text-gray-600">(pdf&apos;s only)</div>
                  </>
                )}
              </div>
            </section>
            <div className="col-span-2">
              <ErrorMessage errors={formState.errors} name="signature" as={ErrorMessageTag} />
            </div>
          </ResponsiveGridColumn>
        </FormGrid>
      </PageGrid>
    </form>
  );
};
SubmissionForm.propTypes = {
  data: PropTypes.object,
};
const AlreadySubmitted = ({ data }) => {
  return (
    <PageGrid
      heading="Sign and Submit Inventory"
      subtext="In keeping with the requirement of Section R317-7-6.4(C) of the Utah Administrative Rules for the Underground Injection Control Program that the owner or operator must submit inventory information, the UIC Inventory Form must be signed by the owner or operator (or his/her legal representative) of the injection well(s) for which the inventory information is being submitted."
      submit={false}
      back={true}
    >
      <h2 className="mb-6 text-center text-xl font-semibold">This inventory has been submitted</h2>
      <h3 className="mb-2 text-lg font-medium">
        Inventory status: <span className="text-xl font-black text-blue-700">{data.status}</span>
      </h3>
      <ResponsiveGridColumn full={true}>
        This inventory was submitted on {dateFormatter.format(Date.parse(data.submittedOn))} and signed for by{' '}
        {data.signature}.
      </ResponsiveGridColumn>
    </PageGrid>
  );
};
AlreadySubmitted.propTypes = {
  data: PropTypes.object,
};
