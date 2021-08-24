import { Fragment, useContext, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { useQuery, useMutation } from 'react-query';
import clsx from 'clsx';
import ky from 'ky';
import { AuthContext } from '../../../AuthProvider';
import {
  ErrorMessageTag,
  FormGrid,
  PageGrid,
  ResponsiveGridColumn,
  TextInput,
  WellSchema as schema,
} from '../../FormElements';
import { Chrome, toast, IncompleteSiteWarning, onRequestError, useParams, useHistory } from '../../PageElements';
import { useOpenClosed } from '../../Hooks';

const wellTypes = [
  {
    value: -1,
    label: 'General',
  },
  {
    value: 5047,
    label: 'Storm water drainage wells',
  },
  {
    value: 5002,
    label: 'Subsurface environmental remediation wells',
  },
  {
    value: 5101,
    label: 'UIC - Regulated large underground wastewater disposal system',
    extra: '(LUWDS) => 5000 gdp',
  },
  {
    value: 5026,
    label: 'Veterinary, kennel, or pet grooming wastewater disposal system',
  },
];

function CreateOrEditWell() {
  const { authInfo } = useContext(AuthContext);
  const { siteId, wellId = -1 } = useParams();

  const { data, status } = useQuery(['well', wellId], () => ky.get(`/api/well/${wellId}/site/${siteId}`).json(), {
    enabled: siteId > 0,
    onError: (error) => onRequestError(error, 'We had some trouble finding this wells information.'),
  });
  const { mutate } = useMutation((json) => ky.post('/api/well', { json }).json(), {
    onSuccess: (response) => {
      toast.success('Well created successfully!');
      history.replace(`/site/${siteId}/well/${response.id}/add-details`);
      history.push(`/site/${siteId}/well/${response.id}/add-location`);
    },
    onError: (error) => onRequestError(error, 'We had some trouble creating this well.'),
  });

  const { control, formState, handleSubmit, register, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const history = useHistory();
  const [site, setSite] = useState({});
  const [show, { open, close }] = useOpenClosed();

  //* pull isDirty from form state to activate proxy
  const { isDirty } = formState;

  useEffect(() => {
    if (!data) {
      return;
    }

    const includeProps = ['orderNumber', 'subClass'];

    const defaults = Object.keys(data).reduce((object, key) => {
      if (!includeProps.includes(key)) {
        return object;
      }

      if (data[key] === null || data[key] === 0) {
        data[key] = '';

        return object;
      }

      object[key] = data[key];

      return object;
    }, {});

    reset(defaults);
  }, [data, reset]);

  useEffect(() => {
    if (!data) {
      return;
    }

    const { siteName, siteType } = data;
    setSite({ name: siteName, title: siteType });
  }, [data]);

  const create = async (formData) => {
    if (!isDirty) {
      return toast.info("We've got your most current information");
    }

    const input = {
      accountId: parseInt(authInfo.id),
      siteId: parseInt(siteId),
      ...formData,
    };

    await mutate(input);
  };

  return (
    <Chrome loading={status === 'loading'}>
      {data?.siteStatus !== 'complete' ? (
        <IncompleteSiteWarning />
      ) : (
        <>
          <form onSubmit={handleSubmit((data) => create(data))}>
            <PageGrid
              heading="Well Inventory"
              subtext="Provide some basic information about the well"
              site={site}
              submit={true}
              submitLabel="Next"
              disabled={!isDirty}
            >
              <FormGrid>
                <ResponsiveGridColumn full={true}>
                  <span className="block mb-4 font-medium text-gray-700">Well Type</span>
                  <Controller
                    name="subClass"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup id="wellType" forwardRef={field.ref} onChange={field.onChange} value={field.value}>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {wellTypes.map((well) => (
                            <RadioGroup.Option
                              key={well.value}
                              value={well.value}
                              className={({ active, checked }) =>
                                clsx(
                                  {
                                    'ring-2 ring-offset-2 ring-offset-blue-800 ring-white ring-opacity-60': active,
                                    'bg-gray-800 text-white': checked,
                                    'bg-white': !checked,
                                  },
                                  'relative rounded-lg shadow-md px-5 py-4 cursor-pointer flex focus:outline-none border'
                                )
                              }
                            >
                              {({ checked }) => (
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center">
                                    <div>
                                      <RadioGroup.Label
                                        as="p"
                                        className={`font-medium ${checked ? 'text-white' : 'text-gray-900'}`}
                                      >
                                        {well.label}
                                      </RadioGroup.Label>
                                      <RadioGroup.Description
                                        as="span"
                                        className={`inline ${checked ? 'text-blue-100' : 'text-gray-500'}`}
                                      >
                                        <span className="text-sm">{well?.extra}</span>
                                      </RadioGroup.Description>
                                    </div>
                                  </div>
                                  {checked && (
                                    <div className="flex-shrink-0 ">
                                      <CheckIcon className="w-6 h-6 text-blue-300" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </RadioGroup.Option>
                          ))}
                        </div>
                      </RadioGroup>
                    )}
                  />
                  <ErrorMessage errors={formState.errors} name="wellType" as={ErrorMessageTag} />
                </ResponsiveGridColumn>
                <ResponsiveGridColumn full={true} half={true}>
                  <TextInput
                    id="orderNumber"
                    type="number"
                    text="UIC inventory form order number"
                    register={register}
                    errors={formState.errors}
                  />
                </ResponsiveGridColumn>
                <ResponsiveGridColumn full={true} half={true}>
                  <p className="italic text-center text-gray-500 md:text-left">
                    To submit a UIC Inventory Form you must have a valid Inventory Review Fee order number or receipt.{' '}
                    <button type="primary" onClick={open}>
                      Click for instructions
                    </button>{' '}
                    to pay the UIC Inventory Fee online.
                  </p>
                </ResponsiveGridColumn>
              </FormGrid>
            </PageGrid>
          </form>
          <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" open={show} onClose={close}>
              <div className="flex items-center justify-center min-h-screen">
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
                  <div className="inline-block w-full max-w-3xl p-6 text-left align-middle transition-all transform bg-white shadow-xl md:my-8 md:rounded-2xl">
                    <Dialog.Title as="h3" className="mb-5 text-xl font-medium leading-6 text-gray-900">
                      UIC Inventory Form help
                    </Dialog.Title>

                    <ul className="list-decimal list-inside">
                      <li className="leading-loose">
                        Go to{' '}
                        <a
                          type="primary"
                          href="https://secure.utah.gov/cart/dwq_cart/products.html"
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          https://secure.utah.gov/cart/dwq_cart/products.html
                        </a>
                        , the Products Page.
                      </li>
                      <li className="leading-loose">
                        Click on{' '}
                        <span className="px-2 py-1 font-mono bg-gray-100 border rounded-full">
                          Payment for UIC Inventory Review Fee
                        </span>{' '}
                        under the UIC Inventory Review heading.
                      </li>
                      <li className="leading-loose">
                        On the Product Detail page, enter the number of facilities (not the number of injection wells)
                        for which you are submitting the UIC Inventory Review Fee. Click on the{' '}
                        <span className="px-2 py-1 font-mono bg-gray-100 border rounded-full">Add to cart</span> button.
                      </li>
                      <li className="leading-loose">
                        On the Your Cart page, confirm the quantity and amount then click on the Checkout button.
                      </li>
                      <li className="leading-loose">
                        On the Enter Your Shipping Address page, enter the contact information for the owner / operator
                        of the UIC facility listed on the first page of the UIC Inventory Information Form in the Please
                        Enter Shipping Info block even though nothing will be shipped out.
                      </li>
                      <li className="leading-loose">
                        In the Additional Information block at the bottom of the page, enter the same UIC Facility Name
                        that you will enter on this UIC Inventory Information Form.
                      </li>
                      <li className="leading-loose">
                        Click on{' '}
                        <span className="px-2 py-1 font-mono bg-gray-100 border rounded-full">Proceed to Payment</span>{' '}
                        button and complete the credit card information then click on the
                        <span className="px-2 py-1 font-mono bg-gray-100 border rounded-full">Continue</span> button.
                      </li>
                      <li className="leading-loose">Enter your order number on this page.</li>
                    </ul>

                    <button type="button" className="mt-4" onClick={close}>
                      Close
                    </button>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>
        </>
      )}
    </Chrome>
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="currentColor" opacity="0.2" />
      <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default CreateOrEditWell;
