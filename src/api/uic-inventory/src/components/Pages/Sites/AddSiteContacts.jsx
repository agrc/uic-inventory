import {
  Description,
  Dialog,
  DialogTitle,
  Label,
  Switch,
  SwitchGroup,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { QuestionMarkCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import clsx from 'clsx';
import ky from 'ky';
import PropTypes from 'prop-types';
import { Fragment, useContext, useEffect, useMemo, useRef } from 'react';
import { BulletList } from 'react-content-loader';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../../AuthContext';
import { contactTypes, serDivisions, validSiteContactTypes, valueToLabel } from '../../../data/lookups';
import {
  ContactSchema,
  ErrorMessage,
  ErrorMessageTag,
  FormGrid,
  PageGrid,
  PhoneInput,
  ResponsiveGridColumn,
  SelectInput,
  Separator,
  SerContactSchema,
  TextInput,
} from '../../FormElements';
import { useOpenClosed } from '../../Hooks/useOpenClosedHook';
import { BackButton, Chrome, Link, onRequestError, toast, useParams } from '../../PageElements';
import { getSiteContacts } from '../loaders';

export function Component() {
  const { siteId } = useParams();
  const { status, error, data } = useQuery(getSiteContacts(siteId));

  return (
    <Chrome loading={status === 'pending'}>
      <PageGrid
        heading="Site Contacts"
        subtext="At least one of the contacts listed must be the owner, owner/operator, or legal representative of the injection well system for which the UIC Well Inventory is being submitted. The owner, owner/operator, or legal representative must be the signatory of the form."
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
                      <Link type="button" data-style="primary" to={`/site/${siteId}/add-location`}>
                        Next
                      </Link>
                    </div>
                  </div>
                  {data?.contacts.filter((x) => validSiteContactTypes.includes(x.contactType)).length === 0 && (
                    <ErrorMessageTag>
                      One of these contact must be either an owner, owner/operator, or legal representative to complete
                      the UIC form submission
                    </ErrorMessageTag>
                  )}
                </div>
              </div>
            </div>
          )}
          {error && (
            <h1>Something went terribly wrong</h1>
            // Log error
          )}
        </div>
      </PageGrid>

      <Separator />

      <CreateContactForm data={data} />

      <BackButton />
    </Chrome>
  );
}
Component.displayName = 'AddSiteContacts';

function CreateContactForm({ data }) {
  const { siteId } = useParams();
  const { authInfo } = useContext(AuthContext);
  const [isSerContact, { open, close }] = useOpenClosed();
  const { control, formState, handleSubmit, register, reset, unregister, watch } = useForm({
    resolver: yupResolver(isSerContact ? SerContactSchema : ContactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      organization: '',
      phoneNumber: '',
      mailingAddress: '',
      state: '',
      zipCode: '',
      contactType: '',
      description: '',
    },
  });

  //* pull value from form state to activate proxy
  const { isDirty } = formState;

  const queryClient = useQueryClient();
  const queryKey = ['contacts', siteId];

  const { mutate } = useMutation({
    mutationFn: (json) => ky.post('/api/contact', { json }),
    onMutate: async (contact) => {
      await queryClient.cancelQueries({ queryKey });
      const previousValue = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        contacts: [...old.contacts, { ...contact, contactType: valueToLabel(contactTypes, contact.contactType) }],
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

  // toggle form fields for different contact types
  useEffect(() => {
    const contactFieldNames = ['contactType', 'mailingAddress', 'city', 'state', 'zipCode'];
    if (isSerContact) {
      unregister(contactFieldNames);
    } else {
      contactFieldNames.forEach(register);
    }
  }, [isSerContact, register, unregister]);

  // set default fields to owner
  useEffect(() => {
    if (!data) {
      return;
    }

    const owner = data.owner;

    //* contact already added do not pre-fill
    if (data.contacts?.find((x) => x.email === owner.email)) {
      return;
    }

    const skipFields = ['access', 'receiveNotifications', 'errors', 'id'];

    const defaults = Object.keys(owner).reduce((object, key) => {
      if (skipFields.includes(key)) {
        return object;
      }

      if (owner[key] === null) {
        object[key] = '';

        return object;
      }

      object[key] = owner[key];

      return object;
    }, {});

    reset({ ...defaults, contactType: '' }, { keepDefaultValues: true });
  }, [data, reset]);

  const create = (formData) => {
    if (!isDirty) {
      return toast.info("We've got your most current information");
    }

    const input = {
      siteId: parseInt(siteId),
      accountId: parseInt(authInfo.id),
      ...formData,
    };

    if (isSerContact) {
      input.contactType = 'project_manager';
      input.serContact = true;
    }

    mutate(input);
  };

  return (
    <form onSubmit={handleSubmit(create)} className="mt-10 sm:mt-0">
      <PageGrid
        heading="Add Contact"
        subtext="Use the form to add more contacts that are capable of providing reliable information about the operation of the site."
        submit={true}
        primary={false}
        submitLabel="Add"
        disabled={!isDirty}
      >
        <FormGrid>
          <ResponsiveGridColumn full={true}>
            <div className="flex rounded-lg border border-blue-600 bg-blue-50/50 px-3 py-2">
              <QuestionMarkCircleIcon className="h-12 w-12 self-center text-blue-600" />
              <div className="ml-4 grow font-medium">
                <ToggleSwitch
                  label="Is this a Department of Environmental Quality contact providing primary regulatory oversight for subsurface environmental remediation?"
                  value={isSerContact}
                  onChange={(newState) => (newState ? open() : close())}
                />
              </div>
            </div>
          </ResponsiveGridColumn>
          {isSerContact ? (
            <SerContactFields control={control} register={register} formState={formState} />
          ) : (
            <ContactFields
              control={control}
              register={register}
              unregister={unregister}
              formState={formState}
              watch={watch}
            />
          )}
        </FormGrid>
      </PageGrid>
    </form>
  );
}

function ContactFields({ control, register, unregister, formState, watch }) {
  const watchContactType = watch('contactType', '');

  // handle conditional control registration
  useEffect(() => {
    if (watchContactType === 'other') {
      register('description', { required: true });
    } else {
      unregister('description');
    }
  }, [watchContactType, register, unregister]);

  return (
    <>
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
        <TextInput id="organization" register={register} errors={formState.errors} />
      </ResponsiveGridColumn>

      <ResponsiveGridColumn full={true} half={true}>
        <SelectInput id="contactType" items={contactTypes} register={register} errors={formState.errors} />
      </ResponsiveGridColumn>

      {watchContactType === 'other' && (
        <ResponsiveGridColumn full={true}>
          <TextInput id="description" register={register} errors={formState.errors} />
        </ResponsiveGridColumn>
      )}

      <ResponsiveGridColumn full={true}>
        <TextInput id="mailingAddress" text="Street address" register={register} errors={formState.errors} />
      </ResponsiveGridColumn>

      <ResponsiveGridColumn full={true} third={true}>
        <TextInput id="city" register={register} errors={formState.errors} />
      </ResponsiveGridColumn>

      <ResponsiveGridColumn full={true} half={true} third={true}>
        <TextInput id="state" register={register} errors={formState.errors} />
      </ResponsiveGridColumn>

      <ResponsiveGridColumn full={true} half={true} third={true}>
        <TextInput id="zipCode" text="ZIP" register={register} errors={formState.errors} />
      </ResponsiveGridColumn>
    </>
  );
}

function SerContactFields({ control, register, formState }) {
  return (
    <>
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
    </>
  );
}

function ToggleSwitch({ label, value, onChange }) {
  return (
    <SwitchGroup className="flex items-center justify-around" as="div">
      <Label className="mr-4 max-w-md">{label}</Label>
      <span className="sr-only">Toggle</span>
      <Switch
        checked={value}
        onChange={onChange}
        className={clsx(
          {
            'bg-indigo-600 focus:ring-indigo-500': value,
            'bg-gray-300 focus:ring-gray-300': !value,
          },
          'relative inline-flex h-8 w-16 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        )}
      >
        <span
          className={clsx(
            {
              'translate-x-8 border-indigo-700 bg-gray-100': value,
              'translate-x-1 border-gray-400 bg-white': !value,
            },
            'inline-block h-7 w-7 transform rounded-full border-2 border-gray-400 transition-transform',
          )}
        />
      </Switch>
    </SwitchGroup>
  );
}

function Address({ mailingAddress, city, state, zipCode }) {
  return (
    <>
      <div>{mailingAddress}</div>
      <div>{city && `${city}, ${state} ${zipCode}`} </div>
    </>
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
            <>
              <div className="text-sm font-medium text-gray-900">{`${data.row.original.firstName} ${data.row.original.lastName}`}</div>
              <div className="text-sm text-gray-500">{valueToLabel(contactTypes, data.row.original.contactType)}</div>
            </>
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
        header: 'Organization',
        accessorKey: 'organization',
      },
      {
        id: 'address',
        header: 'Address',
        cell: function contact({ row }) {
          return <Address {...row.original} />;
        },
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
CreateContactForm.propTypes = {
  data: PropTypes.shape({
    owner: PropTypes.shape({
      email: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      mailingAddress: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zipCode: PropTypes.string,
    }),
    contacts: PropTypes.arrayOf(
      PropTypes.shape({
        email: PropTypes.string,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        contactType: PropTypes.string,
      }),
    ),
  }),
};

ContactFields.propTypes = {
  control: PropTypes.object.isRequired,
  register: PropTypes.func.isRequired,
  unregister: PropTypes.func.isRequired,
  formState: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
};

SerContactFields.propTypes = {
  control: PropTypes.object.isRequired,
  register: PropTypes.func.isRequired,
  formState: PropTypes.object.isRequired,
};

ToggleSwitch.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

Address.propTypes = {
  mailingAddress: PropTypes.string,
  city: PropTypes.string,
  state: PropTypes.string,
  zipCode: PropTypes.string,
};

ContactTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      phoneNumber: PropTypes.string,
      organization: PropTypes.string,
      mailingAddress: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zipCode: PropTypes.string,
      contactType: PropTypes.string,
    }),
  ),
};
ContactTable.propTypes = {
  data: PropTypes.array,
};
Component.propTypes = {
  siteId: PropTypes.string,
};
