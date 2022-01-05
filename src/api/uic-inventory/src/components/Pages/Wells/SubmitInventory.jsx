import { useContext } from 'react';
import { Facebook } from 'react-content-loader';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import ErrorMessageTag from '../../FormElements/ErrorMessage';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import ky from 'ky';
import { Switch } from '@headlessui/react';

import clsx from 'clsx';
import { AuthContext } from '../../../AuthProvider';
import { Chrome, onRequestError, IncompleteInventoryWarning, toast, useParams } from '../../PageElements';
import {
  FormGrid,
  PageGrid,
  ResponsiveGridColumn,
  InventorySubmissionSchema as schema,
  TextInput,
} from '../../FormElements';

export default function SubmitInventory() {
  const { siteId, inventoryId } = useParams();

  const { status, data, error } = useQuery(
    ['inventory', inventoryId],
    () => ky.get(`/api/site/${siteId}/inventory/${inventoryId}`).json(),
    {
      enabled: siteId > 0,
      onError: (error) => onRequestError(error, 'We had some trouble finding this inventory.'),
    }
  );

  return (
    <main>
      <Chrome loading={status === 'loading'}>
        <PageStatus status={status} data={data} error={error} />
      </Chrome>
    </main>
  );
}

const PageStatus = ({ status, data, error }) => {
  const { siteId, inventoryId } = useParams();

  if (status === 'loading') {
    return <Facebook />;
  }

  if (status === 'success') {
    if (data?.status === 404) {
      return <h1>Inventory does not existing</h1>;
    }

    const success = [data.detailStatus, data.locationStatus];
    if (data.wellClass === 5002) {
      success.push(data.contactStatus);
    }

    if (success.every((x) => x)) {
      return <SubmissionForm data={data} />;
    } else {
      return (
        <PageGrid
          heading="Sign and Submit Inventory"
          submit={true}
          disabled={true}
          back={true}
          submitLabel="Submit"
          site={data?.site}
        >
          <IncompleteInventoryWarning siteId={siteId} inventoryId={inventoryId} inventoryStatus={data} />
        </PageGrid>
      );
    }
  }

  if (error?.response?.status === 404) {
    return <h1>This inventory does not exist for this site.</h1>;
  }

  return <h1>Something went terribly wrong</h1>;
};

const SubmissionForm = ({ data }) => {
  const { authInfo } = useContext(AuthContext);
  const { siteId, inventoryId } = useParams();

  const { control, formState, handleSubmit, register } = useForm({
    resolver: yupResolver(schema),
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation(
    (data) => ky.post('/api/inventory/submit', { json: { ...data, id: authInfo.id, siteId, inventoryId } }).json(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory', inventoryId]);
        history.replaceState('/');
      },
      onError: (error) => onRequestError(error, 'We had some trouble submitting this inventory.'),
    }
  );

  const submitInventory = async (data) => {
    await mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(submitInventory)}>
      <PageGrid
        heading="Sign and Submit Inventory"
        subtext="In keeping with the requirement of Section R317-7-6.4(C) of the Utah Administrative Rules for the Underground Injection Control Program that the owner or operator must submit inventory information, the UIC Inventory Form must be signed by the owner or operator (or his/her legal representative) of the injection well(s) for which the inventory information is being submitted."
        submit={true}
        back={true}
        submitLabel="Submit"
        site={data?.site}
      >
        <FormGrid>
          <ResponsiveGridColumn full={true}>
            I verify by typing my name in the Electronic Signature that I am the <strong>owner</strong> or{' '}
            <strong>operator (or legal representative)</strong> of the injection wells, and the information I have
            provided to the UIC program through this form is accurate to the best of my knowledge.
          </ResponsiveGridColumn>
          <ResponsiveGridColumn full={true} half={true}>
            <Switch.Group as="div" className="flex items-center">
              <Switch.Label className="mr-4">Electronic Signature Verification</Switch.Label>
              <span className="sr-only">Electronic Signature Verification</span>
              <Controller
                control={control}
                name="verification"
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
                        'inline-block w-7 h-7 border-2 border-gray-400 rounded-full transform transition-transform'
                      )}
                    />
                  </Switch>
                )}
              />
            </Switch.Group>
            <ErrorMessage errors={formState.errors} name="verification" as={ErrorMessageTag} />
          </ResponsiveGridColumn>
          <ResponsiveGridColumn full={true} half={true}>
            <div>Effective date of submission: {new Date().toLocaleDateString()}</div>
          </ResponsiveGridColumn>
          <ResponsiveGridColumn full={true}>
            <TextInput
              id="signature"
              text="Electronic Signature"
              control={control}
              register={register}
              errors={formState.errors}
            />
          </ResponsiveGridColumn>
        </FormGrid>
      </PageGrid>
    </form>
  );
};
