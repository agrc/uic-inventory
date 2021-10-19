import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Chrome, onRequestError, toast, useHistory, useParams } from '../PageElements';
import { Facebook } from 'react-content-loader';
import { Switch } from '@headlessui/react';
import { AuthContext } from '../../AuthProvider';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import ky from 'ky';
import clsx from 'clsx';
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
import { useContext, useEffect } from 'react';

export function Profile() {
  const { id } = useParams();
  const { authInfo } = useContext(AuthContext);
  const history = useHistory();

  const queryClient = useQueryClient();
  const { status, error, data } = useQuery(
    ['profile', parseInt(id || authInfo.id)],
    () => ky.get(`/api/account/${parseInt(id || authInfo.id)}`).json(),
    {
      enabled: id || authInfo?.id ? true : false,
      onError: (error) => onRequestError(error, 'We had some trouble finding your profile.'),
    }
  );
  const { mutate } = useMutation((data) => ky.put('/api/account', { json: { ...data, id: authInfo.id } }).json(), {
    onSuccess: () => queryClient.invalidateQueries('auth'),
    onError: (error) => onRequestError(error, 'We had some trouble updating your profile.'),
  });

  const { control, formState, handleSubmit, register, reset } = useForm({
    resolver: yupResolver(schema),
  });

  //* pull isDirty from form state to activate proxy
  const { isDirty } = formState;
  const {
    getValues: notificationValues,
    control: notificationControl,
    handleSubmit: handleNotificationSubmit,
    formState: notificationFormState,
    reset: notificationReset,
  } = useForm({});
  //* pull isDirty from form state to activate proxy
  const { isDirty: isNotificationDirty } = notificationFormState;

  // fill form fields with existing data
  useEffect(() => {
    if (data) {
      const defaults = data;

      for (let name in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, 'name') && defaults[name] === null) {
          defaults[name] = '';
        }
      }

      notificationReset({ ...notificationValues(), receiveNotifications: defaults.receiveNotifications });

      //* remove default prop so dirty is accurate
      delete defaults.receiveNotifications;

      reset(defaults);
    }
  }, [data, notificationReset, reset, notificationValues]);

  const mutateAccount = async (state, updateDefaultValues, formData) => {
    if (!isDirty) {
      return toast.info("We've got your most current information");
    }

    const keys = Object.keys(state.dirtyFields);
    const input = {
      id: parseInt(id || authInfo.id),
    };

    for (let key of keys) {
      input[key] = formData[key];
    }

    await mutate(input);

    updateDefaultValues(formData);

    toast.success('Profile updated successfully!');
    history.goBack();
  };

  return (
    <main>
      <Chrome loading={status === 'loading'}>
        {status !== 'loading' && !error && (
          <>
            <form onSubmit={handleSubmit((data) => mutateAccount(formState, reset, data))}>
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
                    <TextInput
                      id="email"
                      type="email"
                      text="Email address"
                      register={register}
                      errors={formState.errors}
                    />
                  </ResponsiveGridColumn>

                  <ResponsiveGridColumn full={true} half={true}>
                    <label htmlFor="phoneNumber" className="block font-medium text-gray-700">
                      Phone number
                    </label>
                    <PhoneInput
                      name="phoneNumber"
                      type="tel"
                      country="US"
                      control={control}
                      rules={{ required: true }}
                    />
                    <ErrorMessage errors={formState.errors} name="phoneNumber" as={ErrorMessageTag} />
                  </ResponsiveGridColumn>

                  <ResponsiveGridColumn full={true}>
                    <TextInput id="organization" register={register} errors={formState.errors} />
                  </ResponsiveGridColumn>

                  <ResponsiveGridColumn full={true}>
                    <TextInput
                      id="mailingAddress"
                      text="Street address"
                      register={register}
                      errors={formState.errors}
                    />
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
            {data?.access === 'elevated' ? (
              <form
                onSubmit={handleNotificationSubmit((data) =>
                  mutateAccount(notificationFormState, notificationReset, data)
                )}
                className="mt-10 sm:mt-0"
              >
                <Separator />

                <PageGrid
                  heading="Notifications"
                  subtext="Manage your notifications"
                  submit={true}
                  disabled={!isNotificationDirty}
                >
                  <Switch.Group className="flex items-center" as="div">
                    <Switch.Label className="mr-4">Notify me of administrative events</Switch.Label>
                    <span className="sr-only">Enable notifications</span>
                    <Controller
                      control={notificationControl}
                      name="receiveNotifications"
                      render={({ field: { onChange, value, name } }) => (
                        <Switch
                          checked={value}
                          id={name}
                          onChange={onChange}
                          className={clsx(
                            {
                              'bg-indigo-600 focus:ring-indigo-500': value,
                              'bg-gray-300 focus:ring-gray-300': !value,
                            },
                            'relative inline-flex items-center h-8 rounded-full w-16 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
                          )}
                        >
                          <span
                            className={clsx(
                              {
                                'translate-x-8 border-indigo-700 bg-gray-100': value,
                                'translate-x-1 border-gray-400 bg-white': !value,
                              },
                              'inline-block w-7 h-7 transform border-2 border-gray-400 rounded-full transition-transform'
                            )}
                          />
                        </Switch>
                      )}
                    />
                  </Switch.Group>
                </PageGrid>
              </form>
            ) : null}
          </>
        )}
        {status === 'loading' && <Facebook />}
        {error && (
          <h1>Something went terribly wrong</h1>
          // Log error
        )}
      </Chrome>
    </main>
  );
}

export default Profile;
