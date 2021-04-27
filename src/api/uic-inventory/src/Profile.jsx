import { useQuery, useMutation } from 'graphql-hooks';
import { Controller, useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import ErrorMessageTag from './components/FormElements/ErrorMessage';
import * as yup from 'yup';
import PhoneInput from 'react-phone-number-input/react-hook-form-input';
import { Facebook } from 'react-content-loader';
import { toast } from 'react-toastify';
import { Switch } from '@headlessui/react';

const ACCOUNT_QUERY = `query GetAccount {
  accountById(id: 1) {
    firstName
    lastName
    email
    organization
    phoneNumber
    mailingAddress
    city
    state
    zipCode
    receiveNotifications
    access
  }
}`;

const ACCOUNT_MUTATION = `mutation updateAccount($input: AccountInput!) {
  updateAccount(input: $input) {
    account {
     id
    }
  }
}`;

const schema = yup.object().shape({
  firstName: yup.string().max(128).required().label('First name'),
  lastName: yup.string().max(128).required().label('Last name'),
  email: yup.string().email().max(512).required().label('Email'),
  organization: yup.string().max(512).required().label('Organization'),
  phoneNumber: yup.string().max(12).matches(/^[+]\d{11}$/, 'The phone number is incorrect').required().label('Phone'),
  mailingAddress: yup.string().max(512).required().label('Address'),
  city: yup.string().max(128).required().label('City'),
  state: yup.string().max(128).required().label('State'),
  zipCode: yup.string().max(64).required().label('Zip'),
});

export function Profile() {
  const { loading, error, data } = useQuery(ACCOUNT_QUERY);
  const [updateAccount] = useMutation(ACCOUNT_MUTATION);
  const { control, formState, handleSubmit, register, reset } = useForm({
    resolver: yupResolver(schema)
  });
  const { control: notificationControl, handleSubmit: handleNotificationSubmit, formState: notificationFormState, reset: notificationReset } = useForm({});

  React.useEffect(() => {
    if (data?.accountById) {
      const defaults = data?.accountById;

      for (let name in defaults) {
        if (defaults.hasOwnProperty(name) && defaults[name] === null) {
          defaults[name] = '';
        }
      }

      notificationReset({ receiveNotifications: defaults.receiveNotifications });
      // remove default prop so dirty is correct
      delete defaults.receiveNotifications;

      reset(defaults);
    }
  }, [data]);

  const mutateAccount = async (state, updateDefaultValues, formData) => {
    if (!state.isDirty) {
      return toast.info('We\'ve got your most current information');
    }

    const keys = Object.keys(state.dirtyFields);
    const input = {
      id: 1
      // TODO: get from somewhere
    };

    for (let key of keys) {
      input[key] = formData[key];
    }

    const { errors } = await updateAccount({
      variables: {
        input: { ...input }
      }
    });

    if (errors) {
      return toast.error('We had some trouble updating your profile');
      // TODO: log error
    }

    updateDefaultValues(formData);

    toast.success('Profile updated successfully!');
  };

  return (
    <main>
      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className={`${loading ? 'min-h-screen md:min-h-profile' : 'h-full' } p-4 border-4 border-gray-200 border-dashed rounded-lg`}>
            {!loading && !error && (<>
              <form onSubmit={handleSubmit((data) => mutateAccount(formState, reset, data))}>
                <div>
                  <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                      <div className="px-4 sm:px-0">
                        <h3 className="text-2xl font-medium leading-6 text-gray-900">Personal Information</h3>
                        <p className="mt-1 text-sm text-gray-600">Use a permanent address where you can receive mail.</p>
                      </div>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                      <div className="overflow-hidden shadow sm:rounded-md">
                        <div className="px-4 py-5 bg-white sm:p-6">
                          <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6 sm:col-span-3">
                              <label htmlFor="firstName" className="block font-medium text-gray-700">
                                First name
                              </label>
                              <input type="text" id="firstName" {...register("firstName")} />
                              <ErrorMessage errors={formState.errors} name="firstName" as={ErrorMessageTag} />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                              <label htmlFor="lastName" className="block font-medium text-gray-700">
                                Last name
                              </label>
                              <input type="text" id="lastName" {...register("lastName")} />
                              <ErrorMessage errors={formState.errors} name="lastName" as={ErrorMessageTag} />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                              <label htmlFor="email" className="block font-medium text-gray-700">
                                Email address
                              </label>
                              <input type="email" id="email" {...register("email")} />
                              <ErrorMessage errors={formState.errors} name="email" as={ErrorMessageTag} />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
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
                            </div>

                            <div className="col-span-6">
                              <label htmlFor="organization" className="block font-medium text-gray-700">
                                Organization
                              </label>
                              <input type="text" id="organization" {...register("organization")} />
                              <ErrorMessage errors={formState.errors} name="organization" as={ErrorMessageTag} />
                            </div>

                            <div className="col-span-6">
                              <label htmlFor="mailingAddress" className="block font-medium text-gray-700">
                                Street address
                              </label>
                              <input type="text" id="mailingAddress" {...register("mailingAddress")} />
                              <ErrorMessage errors={formState.errors} name="mailingAddress" as={ErrorMessageTag} />
                            </div>

                            <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                              <label htmlFor="city" className="block font-medium text-gray-700">
                                City
                              </label>
                              <input type="text" id="city" {...register("city")} />
                              <ErrorMessage errors={formState.errors} name="city" as={ErrorMessageTag} />
                            </div>

                            <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                              <label htmlFor="state" className="block font-medium text-gray-700">
                                State
                              </label>
                              <input type="text" id="state" {...register("state")} />
                              <ErrorMessage errors={formState.errors} name="state" as={ErrorMessageTag} />
                            </div>

                            <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                              <label htmlFor="zipCode" className="block font-medium text-gray-700">
                                ZIP
                              </label>
                              <input type="text" id="zipCode" {...register("zipCode")} />
                              <ErrorMessage errors={formState.errors} name="zipCode" as={ErrorMessageTag} />
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3 text-right bg-gray-100 sm:px-6">
                          <button
                            type="submit"
                            disabled={!formState.isDirty}
                          >
                            Save
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              {data?.accountById.access === 'ELEVATED' ? (
              <form onSubmit={handleNotificationSubmit((data) => mutateAccount(notificationFormState, notificationReset, data))} className="mt-10 sm:mt-0">
                  <div className="hidden sm:block" aria-hidden="true">
                    <div className="py-5">
                      <div className="border-t border-gray-200" />
                    </div>
                  </div>

                  <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <div className="px-4 sm:px-0">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
                      <p className="mt-1 text-gray-600">Decide if you'd like to receive communications.</p>
                    </div>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="overflow-hidden shadow sm:rounded-md">
                      <div className="px-4 py-5 space-y-6 bg-white sm:p-6">
                        <Switch.Group className="flex items-center" as="div">
                          <Switch.Label className="mr-4">
                              Notify me of administrative events
                            </Switch.Label>
                          <span className="sr-only">Enable notifications</span>
                          <Controller
                            control={notificationControl}
                            name="receiveNotifications"
                            render={({
                              field: { onChange, value, name },
                            }) => (
                              <Switch
                                checked={value}
                                id={name}
                                onChange={onChange}
                                className={`${value ? 'bg-indigo-600' : 'bg-gray-300'} relative inline-flex items-center flex-shrink-0 h-6 transition-colors duration-200 ease-in-out border-transparent rounded-full cursor-pointer w-11 b-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700`}
                              >
                                <span
                                  className={`${value ? "translate-x-5" : "translate-x-1"
                                    } pointer-events-none inline-block w-5 h-5 transform bg-white rounded-full shadow ease-in-out duration-300 ring-0`}
                                />
                              </Switch>
                            )}
                          />
                        </Switch.Group>
                      </div>
                      <div className="px-4 py-3 text-right bg-gray-100 sm:px-6">
                        <button
                          type="submit"
                          disabled={!notificationFormState.isDirty}
                        >
                            Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              ) : null}
            </>)}
            {loading && <Facebook />}
            {error && (
              <h1>Something went terribly wrong</h1>
              // Log error
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;
