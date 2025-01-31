import { Description, Dialog, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import clsx from 'clsx';
import ky from 'ky';
import PropTypes from 'prop-types';
import { Fragment, useContext, useMemo, useRef } from 'react';
import { BulletList } from 'react-content-loader';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../../AuthContext';
import { serContactTypes, serDivisions, valueToLabel } from '../../../data/lookups';
import {
  ErrorMessage,
  ErrorMessageTag,
  FormGrid,
  PageGrid,
  PhoneInput,
  ResponsiveGridColumn,
  SelectInput,
  Separator,
  TextInput,
  SerContactSchema as schema,
} from '../../FormElements';
import { useOpenClosed } from '../../Hooks/useOpenClosedHook';
import { BackButton, Chrome, Link, onRequestError, toast, useParams } from '../../PageElements';
import { getSerContact } from '../loaders';

export function Component() {
  const { siteId, inventoryId } = useParams();
  const { authInfo } = useContext(AuthContext);
  const { control, formState, handleSubmit, register, reset } = useForm({
    resolver: yupResolver(schema),
  });

  //* pull value from form state to activate proxy
  const { isDirty } = formState;

  const queryClient = useQueryClient();
  const queryKey = ['ser-contacts', siteId];
  const { status, error, data } = useQuery(getSerContact(siteId));
  const { mutate } = useMutation({
    mutationFn: (json) => ky.post('/api/ser-contact', { json }),
    onMutate: async (contact) => {
      await queryClient.cancelQueries({ queryKey });
      const previousValue = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        contacts: [...old.contacts, { ...contact, contactType: valueToLabel(serContactTypes, contact.contactType) }],
      }));

      return { previousValue };
    },
    onSuccess: () => {
      toast.success('Contact created successfully!');
      reset();
    },
    onError: async (error, _, context) => {
      queryClient.setQueryData(queryKey, context.previousValue);
      onRequestError(error, 'We had some trouble creating this contact.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const create = (formData) => {
    if (!isDirty) {
      return toast.info("We've got your most current information");
    }

    const input = {
      siteId: parseInt(siteId),
      inventoryId: parseInt(inventoryId),
      accountId: parseInt(authInfo.id),
      contactType: 'project_manager',
      serContact: true,
      ...formData,
    };

    mutate(input);
  };

  return (
    <Chrome loading={status === 'pending'}>
      <PageGrid
        heading="Regulatory Contacts"
        subtext="Add contacts that are providing primary oversight in this remediation"
        site={data}
      >
        <div className="min-h-screen mt-5 md:col-span-2 md:mt-0">
          {status === 'pending' && <BulletList style={{ height: '20em' }} />}
          {status !== 'pending' && !error && (
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                    <ContactTable data={data?.contacts} />
                    <div className="bg-gray-100 px-4 py-3 text-right sm:px-6">
                      <Link
                        type="button"
                        data-style="primary"
                        to={`/site/${siteId}/inventory/${inventoryId}/add-wells`}
                      >
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
  const queryKey = ['contacts', siteId];

  const { mutate } = useMutation({
    mutationFn: (json) => ky.delete(`/api/contact`, { json }),
    onMutate: async (mutationData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousValue = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        return {
          ...old,
          contacts: old.contacts.filter((x) => x.id !== mutationData.contactId),
        };
      });

      close();

      return { previousValue };
    },
    onSuccess: () => {
      toast.success('This contact was removed.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context.previousValue);
      onRequestError(error, 'We had some trouble deleting this contact.');
    },
  });
  const columns = useMemo(
    () => [
      {
        header: 'Id',
        accessorKey: 'id',
      },
      {
        id: 'name',
        header: 'Name',
        cell: function name(data) {
          return (
            <div className="text-sm font-medium text-gray-900">{`${data.row.original.firstName} ${data.row.original.lastName}`}</div>
          );
        },
      },
      {
        id: 'contact',
        header: 'Contact',
        cell: function contact(data) {
          return (
            <>
              <div className="text-sm text-gray-900">{data.row.original.email}</div>
              <div className="text-sm text-gray-500">{data.row.original.phoneNumber}</div>
            </>
          );
        },
      },
      {
        header: 'Oversight agency',
        accessorKey: 'organization',
      },
      {
        id: 'action',
        header: 'Action',
        cell: function action(data) {
          return (
            <TrashIcon
              aria-label="delete site"
              className="ml-1 h-6 w-6 cursor-pointer text-red-600 hover:text-red-900"
              onClick={() => {
                open();
                deleteContact.current = data.row.original.id;
              }}
            />
          );
        },
      },
    ],
    [open],
  );

  const table = useReactTable({ columns, data, getCoreRowModel: getCoreRowModel() });

  const queryClient = useQueryClient();

  const remove = () =>
    mutate({
      siteId: parseInt(siteId),
      accountId: parseInt(authInfo.id),
      contactId: deleteContact.current,
    });

  return data?.length < 1 ? (
    <div className="flex flex-col items-center">
      <div className="m-6 px-5 py-4">
        <h2 className="mb-1 text-xl font-medium">Create your first contact</h2>
        <p className="text-gray-700">Get started by filling out the form below to add your first site contact.</p>
        <div className="mb-6 text-center text-sm text-gray-900"></div>
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
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" />
            </TransitionChild>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="mx-auto my-48 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle className="text-lg font-medium leading-6 text-gray-900">
                  Contact Deletion Confirmation
                </DialogTitle>
                <Description className="mt-1">This contact will be permanently deleted</Description>

                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete this contact? This action cannot be undone.
                </p>

                <div className="mt-6 flex justify-around">
                  <button type="button" data-style="primary" className="bg-indigo-900" onClick={remove}>
                    Yes
                  </button>
                  <button
                    type="button"
                    data-style="primary"
                    onClick={() => {
                      close();
                      deleteContact.current = null;
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={clsx(
                    {
                      'font-medium': ['action', 'id'].includes(cell.column.id),
                      'whitespace-nowrap text-right': cell.column.id === 'action',
                    },
                    'px-3 py-4',
                  )}
                >
                  <div className="text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
ContactTable.propTypes = {
  data: PropTypes.array,
};
