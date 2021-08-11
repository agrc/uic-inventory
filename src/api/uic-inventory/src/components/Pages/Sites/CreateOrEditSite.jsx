import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Dialog, Transition } from '@headlessui/react';
import { AuthContext } from '../../../AuthProvider';
import {
  FormGrid,
  NaicsPicker,
  PageGrid,
  ResponsiveGridColumn,
  TextInput,
  SelectInput,
  SiteSchema as schema,
} from '../../FormElements';
import { Chrome, onRequestError, toast, useHistory, useParams } from '../../PageElements';
import { Fragment, useContext, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import ky from 'ky';
import { useOpenClosed } from '../../Hooks';

const ownership = [
  {
    value: 'PB',
    label: 'Private, For-Profit',
  },
  {
    value: 'PN',
    label: 'Private, Not-For-Profit',
  },
  {
    value: 'PF',
    label: 'Private, Farm',
  },
  {
    value: 'PV',
    label: 'Private, Other',
  },
  {
    value: 'FG',
    label: 'Federal Government',
  },
  {
    value: 'SG',
    label: 'State Government',
  },
  {
    value: 'LG',
    label: 'Local Government',
  },
  {
    value: 'OT',
    label: 'Tribal Government',
  },
  {
    value: 'OI',
    label: 'Individual/Household',
  },
  {
    value: 'OR',
    label: 'Other',
  },
];

function CreateOrEditSite() {
  const { siteId } = useParams();
  const { authInfo } = useContext(AuthContext);
  const { data } = useQuery(['site', siteId], () => ky.get(`/api/site/${siteId}`).json(), {
    enabled: siteId ?? 0 > 0 ? true : false,
    onError: (error) => onRequestError(error, 'We had some trouble finding your site.'),
  });
  const { mutate } = useMutation((data) => ky.post('/api/site', { json: { ...data, id: authInfo.id } }).json(), {
    onSuccess: (data) => {
      toast.success('Site created successfully!');
      history.push(`/site/${data.id}/add-contacts`);
    },
    onError: (error) => onRequestError(error, 'We had some trouble creating this site.'),
  });
  const { mutate: update } = useMutation((data) => ky.put('/api/site', { json: data }).json(), {
    onSuccess: (data) => {
      toast.success('Your site was updated.');
      history.push(`/site/${data.id}/add-contacts`);
    },
    onError: (error) => onRequestError(error, 'We had some trouble updating this site.'),
  });
  const { formState, handleSubmit, register, reset, setValue } = useForm({
    resolver: yupResolver(schema),
  });
  //! pull isDirty from form state to activate proxy
  const { isDirty } = formState;
  const history = useHistory();
  const [status, { open, close }] = useOpenClosed(false);

  // set existing form values
  useEffect(() => {
    if (!data) {
      return;
    }

    let defaults = data;
    for (let name in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, 'name') && defaults[name] === null) {
        defaults[name] = '';
      }
    }

    console.log(defaults);

    reset(defaults);
  }, [data, reset]);

  const createOrUpdateSite = (data) => {
    if (!isDirty) {
      return history.push(`/site/${data.id}/add-contacts`);
    }

    if (siteId) {
      return updateSite(data);
    }

    return createSite(data);
  };

  const updateSite = (formData) => {
    const input = { ...formData, siteId: parseInt(siteId), accountId: parseInt(authInfo.id) };

    update(input);
  };

  const createSite = (formData) => {
    const input = {
      accountId: parseInt(authInfo.id),
      ...formData,
    };

    mutate({ ...input });
  };

  return (
    <Chrome>
      <form onSubmit={handleSubmit((data) => createOrUpdateSite(data))}>
        <PageGrid
          heading="Site Details"
          subtext="Provide some basic information about the site"
          submit={true}
          submitLabel="Next"
          disabled={!isDirty}
        >
          <FormGrid>
            <ResponsiveGridColumn full={true} half={true}>
              <TextInput id="name" text="Site Name" register={register} errors={formState.errors} />
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true} half={true}>
              <SelectInput
                id="ownership"
                text="Land ownership at site"
                items={ownership}
                register={register}
                errors={formState.errors}
              />
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true}>
              <p className="italic text-center text-gray-500">
                Select NAICS code and title for the primary business activity at the site
              </p>
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true} className="self-center text-center sm:col-span-2 sm:row-span-3">
              <button type="button" className="w-full sm:items-center sm:h-24" onClick={open}>
                NAICS Code Helper
              </button>
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true} className="sm:col-span-4">
              <TextInput
                id="naicsPrimary"
                text="6-digit NAICS code"
                register={register}
                errors={formState.errors}
                readOnly={true}
                className="bg-gray-100"
              />
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true} className="sm:col-span-4">
              <TextInput
                id="naicsTitle"
                text="Corresponding NAICS title"
                register={register}
                errors={formState.errors}
                readOnly={true}
                className="bg-gray-100"
              />
            </ResponsiveGridColumn>
          </FormGrid>
        </PageGrid>
      </form>
      <Transition appear show={status} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" open={status} onClose={close}>
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

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  NAICS Code Helper
                </Dialog.Title>

                <NaicsPicker
                  updateWith={(item) => {
                    if (item.code.toString().length === 6) {
                      close();
                    }

                    setValue('naicsPrimary', item.code, { shouldValidate: true, shouldDirty: true });
                    setValue('naicsTitle', item.value, { shouldValidate: true, shouldDirty: true });
                  }}
                />

                <button type="button" className="mt-4" onClick={close}>
                  Cancel
                </button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </Chrome>
  );
}

export default CreateOrEditSite;
