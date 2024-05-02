import { Dialog, Switch } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import ky from 'ky';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { Facebook } from 'react-content-loader';
import { Controller, useForm } from 'react-hook-form';
import { AuthContext } from '../../AuthProvider';
import {
  ErrorMessage,
  ErrorMessageTag,
  FormGrid,
  PageGrid,
  PhoneInput,
  ResponsiveGridColumn,
  Separator,
  TextInput,
  ProfileSchema as schema,
} from '../FormElements';
import { useOpenClosed } from '../Hooks';
import { Chrome, ConfirmationModal, onRequestError, toast, useNavigate, useParams } from '../PageElements';

const getLoggedInUserQuery = () => ({
  queryKey: ['auth'],
  queryFn: () => ky.get(`/api/me`).json(),
  staleTime: Infinity,
  onError: (error) => onRequestError(error, 'We had some trouble finding your profile.'),
});

export const loggedInUserLoader = (queryClient) => async () => {
  const query = getLoggedInUserQuery();

  return await queryClient.ensureQueryData(query);
};

export function Component() {
  const { id } = useParams();
  const { authInfo } = useContext(AuthContext);
  const profileId = parseInt(id || authInfo?.id || false);

  const { data, status } = useQuery(getLoggedInUserQuery());

  const { data: profileData, status: profileStatus } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => ky.get(`/api/account/${profileId}`).json(),
    enabled: true,
    staleTime: Infinity,
    gcTime: Infinity,
    onError: (error) => onRequestError(error, 'We had some trouble finding your profile.'),
  });

  const loading = status === 'pending' || profileStatus === 'pending';

  if (loading) {
    return (
      <Chrome loading={loading}>
        <Facebook />
      </Chrome>
    );
  }

  return (
    <main>
      <Chrome loading={loading}>
        <ProfileForm data={profileData} id={profileId} />
        {data.userData.access === 'elevated' && <NotificationForm data={profileData} id={profileId} />}
        {data.userData.access === 'elevated' && <AccessForm profileData={profileData} />}
        <DangerZone profileData={profileData} />
      </Chrome>
    </main>
  );
}

const ProfileForm = ({ id, data }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (data) => ky.put('/api/account', { json: { ...data, id } }).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['all-accounts'] });
      navigate(-1);
    },
    onError: (error) => onRequestError(error, 'We had some trouble updating your profile.'),
  });

  const { control, formState, handleSubmit, register, reset } = useForm({
    resolver: yupResolver(schema),
  });

  //* pull isDirty from form state to activate proxy
  const { isDirty } = formState;

  // fill form fields with existing data
  useEffect(() => {
    if (data) {
      reset({
        organization: data.organization,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        mailingAddress: data.mailingAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      });
    }
  }, [data, reset]);

  useEffect(() => {
    if (!formState.isSubmitSuccessful) {
      return;
    }

    toast.success('Profile updated successfully!');

    reset();
  }, [formState, reset]);

  const mutateAccount = (form, formData) => {
    if (!isDirty) {
      return toast.info("We've got your most current information");
    }

    const keys = Object.keys(form.dirtyFields);
    const input = {
      id,
    };

    for (let key of keys) {
      input[key] = formData[key];
    }

    mutate(input);
  };

  return (
    <form onSubmit={handleSubmit((data) => mutateAccount(formState, data))}>
      <PageGrid
        heading="Personal Information"
        subtext="Use a permanent address where you can receive mail."
        submit={true}
        back={true}
        disabled={!isDirty}
        submitLabel="Save"
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
            <ErrorMessage errors={formState.errors} name="phoneNumber" as={ErrorMessageTag} />
          </ResponsiveGridColumn>

          <ResponsiveGridColumn full={true}>
            <TextInput id="organization" register={register} errors={formState.errors} />
          </ResponsiveGridColumn>

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
  );
};
ProfileForm.propTypes = {
  id: PropTypes.number,
  data: PropTypes.object,
};

const NotificationForm = ({ id, data }) => {
  const { mutate } = useMutation({
    mutationFn: (data) => ky.patch('/api/admin/account', { json: { ...data, id } }).json(),
    onSuccess: (data) => {
      reset({
        receiveNotifications: data.receiveNotifications,
      });
      return toast.success('Settings updated successfully!');
    },
    onError: (error) => onRequestError(error, 'We had some trouble updating your settings.'),
  });

  const { control, handleSubmit, formState, reset } = useForm({
    defaultValues: { receiveNotifications: false },
  });

  // fill form fields with existing data
  useEffect(() => {
    if (data) {
      reset({
        receiveNotifications: data.receiveNotifications,
      });
    }
  }, [data, reset]);

  //* pull isDirty from form state to activate proxy
  const { isDirty } = formState;

  const updateNotifications = async (formData) => {
    if (!isDirty) {
      return toast.info("We've got your most current information");
    }

    const input = {
      id,
      receiveNotifications: formData.receiveNotifications,
    };

    await mutate(input);
  };

  return (
    <form onSubmit={handleSubmit(updateNotifications)} className="mt-10 sm:mt-0">
      <Separator />

      <PageGrid heading="Notifications" subtext="Manage your notifications" submit={true} disabled={!isDirty}>
        <Switch.Group className="flex items-center" as="div">
          <Switch.Label className="mr-4">Notify me of administrative events</Switch.Label>
          <span className="sr-only">Enable notifications</span>
          <Controller
            control={control}
            name="receiveNotifications"
            render={({ field: { onChange, value, name } }) => (
              <Switch
                defaultChecked={value}
                id={name}
                onChange={onChange}
                className={clsx(
                  {
                    'bg-indigo-600 focus:ring-indigo-500': value,
                    'bg-gray-300 focus:ring-gray-300': !value,
                  },
                  'relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
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
            )}
          />
        </Switch.Group>
      </PageGrid>
    </form>
  );
};
NotificationForm.propTypes = {
  id: PropTypes.number,
  data: PropTypes.object,
};

const AccessForm = ({ profileData }) => {
  const { id } = useParams();
  const { authInfo } = useContext(AuthContext);
  const profileId = parseInt(id || authInfo?.id || false);
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (json) => ky.patch('/api/admin/account', { json }).json(),
    onSuccess: (data) => {
      reset({
        access: data.access === 'elevated',
      });

      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['profile', profileId] });

      return toast.success('Settings updated successfully!');
    },
    onError: (error) => onRequestError(error, 'We had some trouble updating your settings.'),
  });

  const { control, handleSubmit, formState, reset } = useForm({
    defaultValues: { receiveNotifications: false },
  });

  // fill form fields with existing data
  useEffect(() => {
    if (profileData) {
      reset({
        access: profileData.access === 'elevated',
      });
    }
  }, [profileData, reset]);

  //* pull isDirty from form state to activate proxy
  const { isDirty } = formState;

  const updateAccess = (formData) => {
    if (!isDirty) {
      return toast.info("We've got your most current information");
    }

    const input = {
      id: profileId,
      access: formData.access ? 'elevated' : 'standard',
    };

    mutate(input);
  };

  return (
    <form onSubmit={handleSubmit(updateAccess)} className="mt-10 sm:mt-0">
      <Separator />

      <PageGrid
        heading="Account Access"
        subtext="Update the access level of this account"
        submit={true}
        disabled={!isDirty}
      >
        <Switch.Group className="flex items-center" as="div">
          <Switch.Label className="mr-4">Allow me to perform administrative events</Switch.Label>
          <span className="sr-only">Update access</span>
          <Controller
            control={control}
            name="access"
            render={({ field: { onChange, value, name } }) => (
              <Switch
                defaultChecked={value}
                id={name}
                onChange={onChange}
                className={clsx(
                  {
                    'bg-indigo-600 focus:ring-indigo-500': value,
                    'bg-gray-300 focus:ring-gray-300': !value,
                  },
                  'relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
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
            )}
          />
        </Switch.Group>
      </PageGrid>
    </form>
  );
};
AccessForm.propTypes = {
  profileData: PropTypes.object,
};
const DangerZone = () => {
  const [isOpen, { open, close }] = useOpenClosed();
  const { id } = useParams();
  const { authInfo } = useContext(AuthContext);
  const profileId = parseInt(id || authInfo?.id || false);

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: () => ky.delete(`/api/account/${profileId}`),
    onSuccess: () => {
      close();

      if (!id) {
        queryClient.clear();
        window.location.href = '/api/logout';
      } else {
        window.location.href = '/';
      }
    },
    onError: (error) => onRequestError(error, 'We had some trouble deleting your account.'),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        open();
      }}
      className="mt-10 sm:mt-0"
    >
      <ConfirmationModal isOpen={isOpen} onClose={close} onYes={mutate}>
        <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">Delete Account Confirmation</Dialog.Title>
        <Dialog.Description className="mt-1">Your account will be permanently deleted</Dialog.Description>
        <p className="mt-1 text-sm text-gray-500">
          Are you sure you want to delete your account? This action cannot be undone...
        </p>
      </ConfirmationModal>
      <Separator />
      <PageGrid
        heading="Danger Zone"
        subtext="Once you delete your account, there is no going back. Please be certain."
        submit={true}
        submitLabel={!id ? 'Delete my account' : 'Delete this account'}
        // disabled={!isDirty}
      >
        <p className="font-semibold">
          The following information associated with your account will be retained according to retention schedule{' '}
          <a
            href="https://axaemarchives.utah.gov/cgi-bin/appxretcget.cgi?WEBINPUT_RUNWHAT=HTML_1SERIES&amp;WEBINPUT_BIBLGRPC_RID=81505&amp;A=B"
            rel="nofollow"
            data-style="link"
          >
            81505 - Underground injection control program files
          </a>
          :
        </p>
        <ul className="ml-2 mt-2 list-inside list-decimal">
          <li>
            All submitted sites/well inventories and associated data will be retained for the retention period
            including:
            <ul className="ml-4 mt-2 list-inside list-disc">
              <li>Site name, location, and ownership</li>
              <li>Name, email, phone number, organization, and address of associated site contacts/signatories</li>
              <li>Type, details, operating status, and location of injection wells</li>
            </ul>
          </li>
        </ul>
        <p className="mt-4 font-semibold text-red-500">
          The following information associated with your account will be deleted:
        </p>
        <ul className="ml-2 mt-2 list-inside list-decimal text-red-500">
          <li>All sites (including all associated information) with no well inventories</li>
          <li>All sites (including all associated information) with only draft inventories</li>
          <li>All draft well inventories</li>
          <li>All profile information</li>
        </ul>
      </PageGrid>
    </form>
  );
};
