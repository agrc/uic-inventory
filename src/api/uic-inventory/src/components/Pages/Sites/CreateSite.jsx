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
import { Chrome, toast, useHistory } from '../../PageElements';
import { Fragment, useContext } from 'react';
import { useMutation } from 'react-query';
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

function CreateSite() {
  const { authInfo } = useContext(AuthContext);
  const { mutate } = useMutation((data) => ky.post('/api/site', { json: { ...data, id: authInfo.id } }).json(), {
    onSuccess: (data) => {
      toast.success('Site created successfully!');
      history.push(`/site/${data.id}/add-contacts`);
    },
    onError: async (err) => {
      // TODO: log error
      console.error(err);
      let toastMessage = 'We had some trouble creating the site';

      const response = await err.response.json();

      if (response.message) {
        toastMessage = response.message;
      }

      return toast.error(toastMessage);
    },
  });
  const { formState, handleSubmit, register, setValue } = useForm({
    resolver: yupResolver(schema),
  });
  //! pull isDirty from form state to activate proxy
  const { isDirty } = formState;
  const history = useHistory();
  const [status, { open, close }] = useOpenClosed(false);

  const create = async (formData) => {
    if (!isDirty) {
      return toast.info("We've got your most current information");
    }

    const input = {
      id: parseInt(authInfo.id),
      ...formData,
    };

    await mutate({ ...input });
  };

  return (
    <Chrome>
      <form onSubmit={handleSubmit((data) => create(data))}>
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
                id="naics"
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

                    setValue('naics', item.code, { shouldValidate: true, shouldDirty: true });
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

export default CreateSite;
