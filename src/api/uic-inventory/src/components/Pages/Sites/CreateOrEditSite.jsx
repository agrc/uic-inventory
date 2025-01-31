import { Dialog, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { Fragment, useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AuthContext } from '../../../AuthContext';
import { ownershipTypes } from '../../../data/lookups';
import {
  FormGrid,
  NaicsPicker,
  NaicsTypeAhead,
  PageGrid,
  ResponsiveGridColumn,
  SelectInput,
  TextInput,
  SiteSchema as schema,
} from '../../FormElements';
import { useOpenClosed } from '../../Hooks';
import { Chrome, onRequestError, toast, useNavigate, useParams } from '../../PageElements';
import { getSites } from '../loaders';

export function Component() {
  const { siteId } = useParams();
  const { authInfo } = useContext(AuthContext);
  const [naicsCode, setNaicsCode] = useState([]);
  const navigate = useNavigate();
  const [status, { open, close }] = useOpenClosed(false);

  const { control, formState, handleSubmit, register, reset, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      //! this makes the downshift think it's uncontrolled on the first render
      naicsPrimary: '',
    },
  });

  const queryClient = useQueryClient();
  const queryKey = ['site', siteId];

  const { data } = useQuery(getSites(siteId));
  const { mutate } = useMutation({
    mutationFn: (data) => ky.post('/api/site', { json: { ...data, id: authInfo.id } }).json(),
    onSuccess: (data) => {
      toast.success('Site created successfully!');
      navigate(`/site/${data.id}/add-contacts`, { replace: true });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => onRequestError(error, 'We had some trouble creating this site.'),
  });
  const { mutate: update } = useMutation({
    mutationFn: (data) => ky.put('/api/site', { json: data }).json(),
    onSuccess: (data) => {
      toast.success('Your site was updated.');
      navigate(`/site/${data.id}/add-contacts`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => onRequestError(error, 'We had some trouble updating this site.'),
  });
  const { isFetching } = useQuery({
    queryKey: ['naicsCodes', naicsCode],
    queryFn: () => ky.get(`/api/naics/${naicsCode}/single`).json(),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: naicsCode?.length > 0 ? true : false,
    onSuccess: (data) => {
      setValue('naicsPrimary', naicsCode, { shouldValidate: true, shouldDirty: true });
      setValue('naicsTitle', data, { shouldValidate: true, shouldDirty: true });
    },
    onError: (error) => onRequestError(error, 'We had some trouble finding NAICS codes.'),
  });

  //! pull isDirty from form state to activate proxy
  const { isDirty } = formState;

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

    reset(defaults);
  }, [data, reset]);

  const createOrUpdateSite = async (data) => {
    if (!isDirty) {
      return (await navigate(1)) || (await navigate(`/site/${data.id}/add-contacts`));
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
    <Chrome className="relative">
      <form onSubmit={handleSubmit(createOrUpdateSite)}>
        <PageGrid
          heading="Site Details"
          subtext="Provide some basic information about the site"
          submit={true}
          submitLabel="Next"
          back={true}
          disabled={!isDirty && isFetching}
        >
          <FormGrid>
            <ResponsiveGridColumn full={true} half={true}>
              <TextInput id="name" text="Site Name" register={register} errors={formState.errors} />
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true} half={true}>
              <SelectInput
                id="ownership"
                text="Land ownership at site"
                items={ownershipTypes}
                register={register}
                errors={formState.errors}
              />
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true}>
              <p className="text-center italic text-gray-500">
                Select NAICS code and title for the primary business activity at the site
              </p>
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true} className="self-center text-center sm:col-span-2 sm:row-span-3">
              <button type="button" data-style="secondary" className="w-full sm:h-24 sm:items-center" onClick={open}>
                NAICS Code Helper
              </button>
            </ResponsiveGridColumn>

            <ResponsiveGridColumn full={true} className="sm:col-span-4">
              <Controller
                name="naicsPrimary"
                control={control}
                render={({ field }) => (
                  <NaicsTypeAhead
                    id="naicsPrimary"
                    field={field}
                    errors={formState.errors}
                    setNaicsCode={setNaicsCode}
                  />
                )}
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

            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="my-8 inline-block w-full transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  NAICS Code Helper
                </DialogTitle>

                <NaicsPicker
                  updateWith={(item) => {
                    setValue('naicsPrimary', item.code, { shouldValidate: true, shouldDirty: true });
                    setValue('naicsTitle', item.value, { shouldValidate: true, shouldDirty: true });
                  }}
                />

                <button type="button" data-style="primary" className="mt-4" onClick={close}>
                  Select
                </button>
              </div>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </Chrome>
  );
}
