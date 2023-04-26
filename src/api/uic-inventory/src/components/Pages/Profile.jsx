import { useContext, useEffect } from 'react';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import ky from 'ky';
import { yupResolver } from '@hookform/resolvers/yup';
import { Facebook } from 'react-content-loader';
import { Switch } from '@headlessui/react';
import { Chrome, onRequestError, toast, useNavigate, useParams } from '../PageElements';
import { AuthContext } from '../../AuthProvider';
import {
  ErrorMessage,
  ErrorMessageTag,
  FormGrid,
  PageGrid,
  PhoneInput,
  ProfileSchema as schema,
  ResponsiveGridColumn,
  Separator,
  TextInput,
} from '../FormElements';

export function Profile() {
  const { id } = useParams();
  const { authInfo } = useContext(AuthContext);
  const profileId = parseInt(id || authInfo?.id || false);

  const { status, data } = useQuery(['profile', profileId], () => ky.get(`/api/account/${profileId}`).json(), {
    enabled: profileId ? true : false,
    onError: (error) => onRequestError(error, 'We had some trouble finding your profile.'),
  });

  const { data: me } = useQuery(['auth'], () => ky.get(`/api/me`).json(), {
    enabled: authInfo?.id ? true : false,
    onError: (error) => onRequestError(error, 'We had some trouble finding your profile.'),
  });

  return (
    <main>
      <Chrome loading={status === 'loading'}>
        {status === 'loading' ? <Facebook /> : <ProfileForm data={data} id={profileId} />}
        {data?.access === 'elevated' && <NotificationForm data={data} id={profileId} />}
        {me?.userData?.access === 'elevated' && <AccessForm profileData={data} />}
      </Chrome>
    </main>
  );
}

const ProfileForm = ({ id, data }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate } = useMutation((data) => ky.put('/api/account', { json: { ...data, id } }).json(), {
    onSuccess: () => {
      queryClient.invalidateQueries('auth');
      queryClient.invalidateQueries('all-accounts');
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

  const mutateAccount = async (form, formData) => {
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

    await mutate(input);
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

const NotificationForm = ({ id, data }) => {
  const { mutate } = useMutation((data) => ky.patch('/api/admin/account', { json: { ...data, id } }).json(), {
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
                  'relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
                )}
              >
                <span
                  className={clsx(
                    {
                      'translate-x-8 border-indigo-700 bg-gray-100': value,
                      'translate-x-1 border-gray-400 bg-white': !value,
                    },
                    'inline-block h-7 w-7 transform rounded-full border-2 border-gray-400 transition-transform'
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

const AccessForm = ({ profileData }) => {
  const { id } = useParams();
  const { authInfo } = useContext(AuthContext);
  const profileId = parseInt(id || authInfo?.id || false);
  const queryClient = useQueryClient();

  const { mutate } = useMutation((json) => ky.patch('/api/admin/account', { json }).json(), {
    onSuccess: (data) => {
      reset({
        access: data.access === 'elevated',
      });

      queryClient.invalidateQueries('auth');
      queryClient.invalidateQueries('profile', profileId);

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

  const updateAccess = async (formData) => {
    if (!isDirty) {
      return toast.info("We've got your most current information");
    }

    const input = {
      id: profileId,
      access: formData.access ? 'elevated' : 'standard',
    };

    await mutate(input);
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
                  'relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
                )}
              >
                <span
                  className={clsx(
                    {
                      'translate-x-8 border-indigo-700 bg-gray-100': value,
                      'translate-x-1 border-gray-400 bg-white': !value,
                    },
                    'inline-block h-7 w-7 transform rounded-full border-2 border-gray-400 transition-transform'
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

export default Profile;
