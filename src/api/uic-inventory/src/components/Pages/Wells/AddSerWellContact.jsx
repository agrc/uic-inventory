import { Fragment, useContext, useMemo, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import { BulletList } from 'react-content-loader';
import { yupResolver } from '@hookform/resolvers/yup';
import { TrashIcon } from '@heroicons/react/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ky from 'ky';
import { useTable } from 'react-table';
import { AuthContext } from '../../../AuthProvider';
import { BackButton, Chrome, onRequestError, toast, useParams, Link } from '../../PageElements';
import {
  SerContactSchema as schema,
  ErrorMessage,
  ErrorMessageTag,
  FormGrid,
  PageGrid,
  PhoneInput,
  ResponsiveGridColumn,
  Separator,
  SelectInput,
  TextInput,
} from '../../FormElements';
import { useOpenClosed } from '../../Hooks/useOpenClosedHook';
import { serContactTypes, serDivisions, valueToLabel } from '../../../data/lookups';

function AddSerWellContact() {
  const { siteId, inventoryId } = useParams();
  const { authInfo } = useContext(AuthContext);
  const { control, formState, handleSubmit, register, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const queryClient = useQueryClient();
  const { status, error, data } = useQuery(
    ['ser-contacts', siteId],
    async () => {
      const response = await ky.get(`/api/site/${siteId}/contacts`).json();

      return {
        ...response,
        contacts: response.contacts.filter((contact) => contact.contactType === 'project_manager'),
      };
    },
    {
      enabled: siteId ?? 0 > 0 ? true : false,
      onError: (error) => onRequestError(error, 'We had some trouble finding your contacts.'),
    }
  );
  const { mutate } = useMutation((json) => ky.post('/api/contact', { json }), {
    onMutate: async (contact) => {
      await queryClient.cancelQueries(['ser-contacts', siteId]);
      const previousValue = queryClient.getQueryData(['ser-contacts', siteId]);

      queryClient.setQueryData(['ser-contacts', siteId], (old) => ({
        ...old,
        contacts: [...old.contacts, { ...contact, contactType: valueToLabel(serContactTypes, contact.contactType) }],
      }));

      return previousValue;
    },
    onSuccess: () => {
      toast.success('Contact created successfully!');

      reset({});
    },
    onSettled: () => {
      queryClient.invalidateQueries(['ser-contacts', siteId]);
    },
    onError: async (error, _, previousValue) => {
      queryClient.setQueryData(['ser-contacts', siteId], previousValue);
      onRequestError(error, 'We had some trouble creating this contact.');
    },
  });

  //! pull value from form state to activate proxy
  const { isDirty } = formState;

  const create = (formData) => {
    if (!isDirty) {
      return toast.info("We've got your most current information");
    }

    const input = {
      siteId: parseInt(siteId),
      accountId: parseInt(authInfo.id),
      contactType: 'project_manager',
    };

    for (let key of Object.keys(formData)) {
      input[key] = formData[key];
    }

    mutate(input);
  };

  return (
    <Chrome loading={status === 'loading'}>
      <PageGrid
        heading="Regulatory Contacts"
        subtext="Add contacts that are providing primary oversight in this remediation"
        site={data}
      >
        <div className="min-h-screen mt-5 md:mt-0 md:col-span-2">
          {status === 'loading' && <BulletList style={{ height: '20em' }} />}
          {status !== 'loading' && !error && (
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                    <ContactTable data={data?.contacts} />
                    <div className="px-4 py-3 text-right bg-gray-100 sm:px-6">
                      <Link type="button" meta="default" to={`/site/${siteId}/inventory/${inventoryId}/add-wells`}>
                        Next
                      </Link>
                    </div>
                  </div>
                  {data?.contacts.length === 0 && (
                    <ErrorMessageTag>
                      A regulatory contact is required for subsurface environmental remediation wells
                    </ErrorMessageTag>
                  )}
                </div>
              </div>
            </div>
          )}
          {error && (
            <h1>Something went terribly wrong</h1>
            // todo: Log error
          )}
        </div>
      </PageGrid>

      <Separator />

      <form onSubmit={handleSubmit(create)} className="mt-10 sm:mt-0">
        <PageGrid
          heading="Add Contact"
          subtext="Use the form to add regulatory contacts for subsurface environmental remediation wells."
          submit={true}
          submitLabel="Add"
          disabled={!isDirty}
        >
          <FormGrid>
            <ResponsiveGridColumn full={true} half={true}>
              <TextInput id="firstName" control={control} register={register} errors={formState.errors} />
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true} half={true}>
              <TextInput id="lastName" register={register} errors={formState.errors} />
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true} half={true}>
              <TextInput id="email" type="email" text="Email address" register={register} errors={formState.errors} />
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true} half={true}>
              <label htmlFor="phoneNumber" className="block font-medium text-gray-700">
                Phone number
              </label>
              <PhoneInput name="phoneNumber" type="tel" country="US" control={control} rules={{ required: true }} />
              <ErrorMessage name="phoneNumber" errors={formState.errors} as={ErrorMessageTag} />
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true} half={true}>
              <SelectInput
                text="Oversight agency"
                items={serDivisions}
                id="organization"
                register={register}
                errors={formState.errors}
              />
            </ResponsiveGridColumn>
          </FormGrid>
        </PageGrid>
      </form>
      <BackButton />
    </Chrome>
  );
}

function ContactTable({ data }) {
  const { siteId } = useParams();
  const { authInfo } = useContext(AuthContext);
  const [isOpen, { open, close }] = useOpenClosed();
  const deleteContact = useRef();

  const { mutate } = useMutation((json) => ky.delete(`/api/contact`, { json }), {
    onMutate: async (mutationData) => {
      await queryClient.cancelQueries(['contacts', siteId]);
      const previousValue = queryClient.getQueryData(['contacts', siteId]);

      queryClient.setQueryData(['contacts', siteId], (old) => {
        return {
          ...old,
          contacts: old.contacts.filter((x) => x.id !== mutationData.contactId),
        };
      });

      close();

      return previousValue;
    },
    onSuccess: () => {
      toast.success('This contact was removed.');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['contacts', siteId]);
    },
    onError: (error, _, previousValue) => {
      queryClient.setQueryData(['contacts', siteId], previousValue);
      onRequestError(error, 'We had some trouble deleting this contact.');
    },
  });
  const columns = useMemo(
    () => [
      {
        Header: 'Id',
        accessor: 'id',
      },
      {
        id: 'name',
        Header: 'Name',
        Cell: function name(data) {
          return (
            <div className="text-sm font-medium text-gray-900">{`${data.row.original.firstName} ${data.row.original.lastName}`}</div>
          );
        },
      },
      {
        id: 'contact',
        Header: 'Contact',
        Cell: function contact(data) {
          return (
            <>
              <div className="text-sm text-gray-900">{data.row.original.email}</div>
              <div className="text-sm text-gray-500">{data.row.original.phoneNumber}</div>
            </>
          );
        },
      },
      {
        Header: 'Oversight agency',
        accessor: 'organization',
      },
      {
        id: 'action',
        Header: 'Action',
        Cell: function action(data) {
          return (
            <TrashIcon
              aria-label="delete site"
              className="w-6 h-6 ml-1 text-red-600 cursor-pointer hover:text-red-900"
              onClick={() => {
                open();
                deleteContact.current = data.row.original.id;
              }}
            />
          );
        },
      },
    ],
    [open]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

  const queryClient = useQueryClient();

  const remove = () =>
    mutate({
      siteId: parseInt(siteId),
      accountId: parseInt(authInfo.id),
      contactId: deleteContact.current,
    });

  return data?.length < 1 ? (
    <div className="flex flex-col items-center">
      <div className="px-5 py-4 m-6">
        <h2 className="mb-1 text-xl font-medium">Create your first contact</h2>
        <p className="text-gray-700">Get started by filling out the form below to add your first site contact.</p>
        <div className="mb-6 text-sm text-center text-gray-900"></div>
      </div>
    </div>
  ) : (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          open={isOpen}
          onClose={() => {
            close();
            deleteContact.current = null;
          }}
          className="fixed inset-0 z-10 overflow-y-auto"
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 mx-auto my-48 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                  Contact Deletion Confirmation
                </Dialog.Title>
                <Dialog.Description className="mt-1">This contact will be permanently deleted</Dialog.Description>

                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete this contact? This action cannot be undone.
                </p>

                <div className="flex justify-around mt-6">
                  <button type="button" meta="default" className="bg-indigo-900" onClick={remove}>
                    Yes
                  </button>
                  <button
                    type="button"
                    meta="default"
                    onClick={() => {
                      close();
                      deleteContact.current = null;
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {headerGroups.map((headerGroup) => (
            <tr key={headerGroup.index} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  key={`${headerGroup.index}-${column.id}`}
                  {...column.getHeaderProps()}
                  className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
          {rows.map((row) => {
            prepareRow(row);

            return (
              <tr key={`${row.index}`} {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td
                    key={`${row.index}-${cell.column.id}`}
                    className={clsx(
                      {
                        'font-medium': ['action', 'id'].includes(cell.column.id),
                        'text-right whitespace-nowrap': cell.column.id === 'action',
                      },
                      'px-3 py-4'
                    )}
                    {...cell.getCellProps()}
                  >
                    <div className="text-sm text-gray-900">{cell.render('Cell')}</div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default AddSerWellContact;
