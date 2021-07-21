import { BulletList } from 'react-content-loader';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Chrome, toast, useParams, Link } from '../../PageElements';
import {
  ContactSchema as schema,
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
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ky from 'ky';

const contactType = [
  {
    value: 'owner_operator',
    label: 'Owner/Operator',
  },
  {
    value: 'facility_owner',
    label: 'Owner',
  },
  {
    value: 'facility_operator',
    label: 'Operator',
  },
  {
    value: 'facility_manager',
    label: 'Facility Manager',
  },
  {
    value: 'legal_rep',
    label: 'Legal Representative',
  },
  {
    value: 'office_rep',
    label: 'Official Representative',
  },
  {
    value: 'contractor',
    label: 'Contractor',
  },
  {
    value: 'project_manager',
    label: 'DEQ Dist Eng/Project Manager',
  },
  {
    value: 'health_dept',
    label: 'Local Health Department',
  },
  {
    value: 'permit_writer',
    label: 'Permit Writer',
  },
  {
    value: 'developer',
    label: 'Developer',
  },
  {
    value: 'other',
    label: 'Other',
  },
];

const valueToLabel = (value) => {
  const item = contactType.find((x) => x.value === value);

  return item?.label ?? value;
};

function AddSiteContacts() {
  const { control, formState, handleSubmit, register, reset, unregister } = useForm({
    resolver: yupResolver(schema),
  });
  const { siteId } = useParams();
  const queryClient = useQueryClient();
  const { status, error, data } = useQuery(['contacts', siteId], () => ky.get(`/api/site/${siteId}/contacts`).json(), {
    enabled: siteId ?? 0 > 0 ? true : false,
  });
  const { mutate } = useMutation((input) => ky.post('/api/contact', { json: { ...input, id: siteId } }), {
    onMutate: async (contact) => {
      await queryClient.cancelQueries(['contacts', siteId]);
      const previousValue = queryClient.getQueryData(['contacts', siteId]);

      queryClient.setQueryData(['contacts', siteId], (old) => ({
        ...old,
        contacts: [...old.contacts, { ...contact, id: 9999, contactType: valueToLabel(contact.contactType) }],
      }));

      return previousValue;
    },
    onSuccess: () => {
      toast.success('Contact created successfully!');
      reset({});
    },
    onSettled: () => {
      queryClient.invalidateQueries(['contacts', siteId]);
    },
    onError: (error, variables, previousValue) => {
      queryClient.setQueryData(['contacts', siteId], previousValue);
      // TODO: log error
      console.error(error);
      return toast.error('We had some trouble creating the contact');
    },
  });

  const [optional, setOptional] = useState(false);
  //! pull isDirty from form state to activate proxy
  const { isDirty } = formState;

  // set default fields to owner
  useEffect(() => {
    if (data) {
      let defaults = data.owner;

      //! contact already added do not pre-fill
      if (data.contacts?.find((x) => x.email === defaults.email)) {
        return;
      }

      for (let name in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, 'name') && defaults[name] === null) {
          defaults[name] = '';
        }
      }

      defaults = { ...defaults, contactType: undefined };
      console.log(defaults);

      reset(defaults);
    }
  }, [data, reset]);

  // handle conditional control registration
  useEffect(() => {
    if (optional) {
      register('description', { required: true });
    } else {
      unregister('description');
    }
  }, [optional, register, unregister]);

  const create = async (formData) => {
    if (!isDirty) {
      return toast.info("We've got your most current information");
    }

    const input = {
      id: parseInt(siteId),
    };

    for (let key of Object.keys(formData)) {
      input[key] = formData[key];
    }

    await mutate({ ...input });
  };

  return (
    <Chrome loading={status === 'loading'}>
      <PageGrid
        heading="Site Contacts"
        subtext="At least one of the contacts listed must be the owner/operator or legal representative of the owner/operator of the injection well system for which the UIC Inventory Information is being submitted. The owner/operator or the legal representative must be the signatory for the form."
      >
        <div className="min-h-screen mt-5 md:mt-0 md:col-span-2">
          {status === 'loading' && <BulletList style={{ height: '20em' }} />}
          {status !== 'loading' && !error && (
            <>
              <ContactsTable data={data?.contacts} />
              <div className="px-4 py-3 text-right bg-gray-100 sm:px-6">
                <Link type="button" to={`/site/${siteId}/add-location`}>
                  Next
                </Link>
              </div>
            </>
          )}
          {error && (
            <h1>Something went terribly wrong</h1>
            // Log error
          )}
        </div>
      </PageGrid>

      <Separator />

      <form onSubmit={handleSubmit(create)} className="mt-10 sm:mt-0">
        <PageGrid
          subtext="Provide additional contacts capable of providing reliable information regarding the operation of the facility."
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
              <TextInput id="organization" register={register} errors={formState.errors} />
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true} half={true}>
              <SelectInput
                id="contactType"
                items={contactType}
                register={register}
                errors={formState.errors}
                onUpdate={(event) => setOptional(event.target.value?.toLowerCase() === 'other')}
              />
            </ResponsiveGridColumn>

            {optional ? (
              <ResponsiveGridColumn full={true}>
                <TextInput id="description" register={register} errors={formState.errors} />
              </ResponsiveGridColumn>
            ) : null}

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
          </FormGrid>
        </PageGrid>
      </form>
    </Chrome>
  );
}

function ContactsTable({ data }) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden border border-b-0 border-gray-200 shadow sm:rounded-t-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Organization
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Address
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.length > 0 ? (
                  data.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{`${item.firstName} ${item.lastName}`}</div>
                        <div className="text-sm text-gray-500">{valueToLabel(item.contactType)}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.email}</div>
                        <div className="text-sm text-gray-500">{item.phoneNumber}</div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-sm text-gray-900">{item.organization}</div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <div>{item.mailingAddress}</div>
                        <div>{`${item.city} ${item.state} ${item.zipCode}`} </div>
                      </td>
                      <td className="px-3 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <span className="text-indigo-600 hover:text-indigo-900">Edit</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 py-4">
                      <div className="text-sm text-center text-gray-900">No contacts have been added yet</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddSiteContacts;
