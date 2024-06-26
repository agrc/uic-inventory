import {
  Description,
  Dialog,
  DialogTitle,
  Label,
  Radio,
  RadioGroup,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import ky from 'ky';
import { Fragment, useContext, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AuthContext } from '../../../AuthProvider';
import { wellTypes } from '../../../data/lookups';
import {
  ErrorMessageTag,
  FormGrid,
  PageGrid,
  ResponsiveGridColumn,
  TextInput,
  WellSchema as schema,
} from '../../FormElements';
import { useOpenClosed } from '../../Hooks';
import { Chrome, onRequestError, toast, useNavigate, useParams } from '../../PageElements';
import { IncompleteSiteWarning } from '../ErrorPages';
import { getInventory } from '../loaders';

export function Component() {
  const { authInfo } = useContext(AuthContext);
  const { siteId, inventoryId = -1 } = useParams();

  const { data, status } = useQuery(getInventory(siteId, inventoryId));
  const { mutate } = useMutation({
    mutationFn: (json) => ky.post('/api/inventory', { json }).json(),
    onSuccess: (response) => {
      toast.success('Inventory created successfully!');

      if (response.subClass === 5002) {
        navigate(`/site/${siteId}/inventory/${response.id}/regulatory-contact`, { replace: true });
      } else {
        navigate(`/site/${siteId}/inventory/${response.id}/add-wells`, { replace: true });
      }
    },
    onError: (error) => onRequestError(error, 'We had some trouble creating this inventory.'),
  });

  const { control, formState, handleSubmit, register, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();
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
    <Chrome loading={status === 'pending'}>
      {data?.site?.status !== 'complete' ? (
        <IncompleteSiteWarning />
      ) : (
        <>
          <form onSubmit={handleSubmit(create)}>
            <PageGrid
              heading="Well Inventory"
              subtext="All wells in this inventory must be of the same subclass. A separate inventory is needed for each subclass of wells. For example, all storm water drainage wells for a property/site can be included in the same inventory. However, if the site also contains a large underground wastewater disposal system, those wells must be submitted as a separate well inventory."
              site={data?.site}
              submit={true}
              back={true}
              submitLabel="Next"
              disabled={!isDirty}
            >
              <FormGrid>
                <ResponsiveGridColumn full={true}>
                  <span className="mb-4 block font-medium text-gray-700">Well Subclass</span>
                  <Controller
                    name="subClass"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup id="wellType" onChange={field.onChange} defaultValue={field.value}>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {wellTypes
                            .filter((well) => well.primary)
                            .map((well) => (
                              <Radio
                                key={well.value}
                                value={well.value}
                                className={({ active, checked }) =>
                                  clsx(
                                    {
                                      'ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-700': active,
                                      'bg-indigo-500 text-white': checked,
                                      'bg-white': !checked,
                                    },
                                    'relative flex cursor-pointer rounded-lg border px-5 py-4 shadow-md focus:outline-none',
                                  )
                                }
                              >
                                {({ checked }) => (
                                  <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center">
                                      <div>
                                        <Label
                                          as="p"
                                          className={`font-medium ${checked ? 'text-white' : 'text-gray-900'}`}
                                        >
                                          {well.label}
                                        </Label>
                                        <Description
                                          as="span"
                                          className={`inline ${checked ? 'text-blue-100' : 'text-gray-500'}`}
                                        >
                                          <span className="text-sm">{well?.extra}</span>
                                        </Description>
                                      </div>
                                    </div>
                                    {checked && (
                                      <div className="shrink-0">
                                        <CheckIcon className="h-6 w-6 text-indigo-100" />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Radio>
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
                    type="text"
                    text="UIC inventory form order number"
                    register={register}
                    errors={formState.errors}
                  />
                </ResponsiveGridColumn>
                <ResponsiveGridColumn full={true} half={true}>
                  <p className="text-center italic text-gray-500 md:text-left">
                    To submit a UIC Inventory Form you must have a valid Inventory Review Fee order number or receipt.{' '}
                    <button data-style="link" onClick={open}>
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
              <div className="min-h-screen flex items-center justify-center">
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
                  <div className="inline-block w-full max-w-3xl transform bg-white p-6 text-left align-middle shadow-xl transition-all md:my-8 md:rounded-2xl">
                    <DialogTitle as="h3" className="mb-5 text-xl font-medium leading-6 text-gray-900">
                      UIC Inventory Form help
                    </DialogTitle>
                    <ul className="list-inside list-decimal">
                      <li className="leading-loose">
                        Navigate to this website:{' '}
                        <a
                          data-style="primary"
                          href="https://s.utah.gov/uic-inventory-review"
                          target="_blank"
                          rel="noreferrer noopener nofollow"
                        >
                          https://s.utah.gov/uic-inventory-review
                        </a>
                      </li>
                      <li className="leading-loose">
                        In the <span className="rounded-full border bg-gray-100 px-2 py-1 font-mono">Item</span> field
                        drop-down menu, select the option for{' '}
                        <span className="rounded-full border bg-gray-100 px-2 py-1 font-mono">
                          UIC Inventory Review
                        </span>
                      </li>
                      <li className="leading-loose">
                        Enter the number of sites (<span className="font-black">not</span> the number of injection
                        wells) in the{' '}
                        <span className="rounded-full border bg-gray-100 px-2 py-1 font-mono">Quantity</span> box for
                        which you are submitting the UIC Inventory Review Fee.
                      </li>
                      <li className="leading-loose">
                        In the{' '}
                        <span className="rounded-full border bg-gray-100 px-2 py-1 font-mono">
                          Facility/Site Name from UIC Inventory Information Form
                        </span>{' '}
                        box, enter the Site Name. This should match the Site Name provided on the first page of this UIC
                        information form.
                      </li>
                      <li className="leading-loose">
                        Complete the{' '}
                        <span className="rounded-full border bg-gray-100 px-2 py-1 font-mono">Contact Information</span>{' '}
                        section and click{' '}
                        <span className="rounded-full border bg-gray-100 px-2 py-1 font-mono">Continue To Payment</span>{' '}
                        to proceed to payment.
                      </li>
                      <li className="leading-loose">
                        After completing the payment process you will receive an order number. Return to this page and
                        enter the first 8 digits of the order number as the{' '}
                        <span className="rounded-full border bg-gray-100 px-2 py-1 font-mono">
                          UIC inventory form order number
                        </span>
                      </li>
                    </ul>
                    <button type="button" data-style="primary" className="mt-4" onClick={close}>
                      Close
                    </button>
                  </div>
                </TransitionChild>
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
