import { useContext, useState } from 'react';
import { ExclamationIcon } from '@heroicons/react/outline';
import clsx from 'clsx';
import { useMutation, useQueryClient } from 'react-query';
import ky from 'ky';
import { Dialog } from '@headlessui/react';
import { AuthContext } from '../../AuthProvider';
import { ConfirmationModal, onRequestError, toast } from '../PageElements';
import { useOpenClosed } from '../Hooks';

export default function Flagged({ reason, siteId, inventoryId }) {
  const { authInfo } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [text, setText] = useState(reason ?? '');

  const { mutate } = useMutation((json) => ky.put('/api/inventory', { json }), {
    onMutate: async () => {
      await queryClient.cancelQueries(['inventory', inventoryId]);
      const previousValue = queryClient.getQueryData(['inventory', inventoryId]);

      queryClient.setQueryData(['inventory', inventoryId], (old) => {
        const updated = {
          ...old,
          site: { ...old.site },
          wells: [...old.wells],
        };

        return updated;
      });

      return previousValue;
    },
    onSettled: () => {
      queryClient.invalidateQueries(['inventory', inventoryId]);
    },
    onSuccess: (_, variables) => {
      if (variables.flagged?.length > 0) {
        toast.success('Flag applied successfully!');
      } else {
        toast.success('Flag resolved successfully!');
      }

      setText('');
    },
    onError: (error) => onRequestError(error, 'We had some trouble updating this inventory.'),
  });

  const setFlag = () => {
    if (text.length < 1) {
      toast.warning('Enter a reason for flagging this submission.');

      return;
    }

    const input = {
      accountId: parseInt(authInfo.id),
      inventoryId: parseInt(inventoryId),
      siteId: parseInt(siteId),
      flagged: text,
    };

    mutate(input);
  };

  const resolveFlag = () => {
    const input = {
      accountId: parseInt(authInfo.id),
      inventoryId: parseInt(inventoryId),
      siteId: parseInt(siteId),
      flagged: '',
    };

    mutate(input);
  };

  if (reason?.length > 0) {
    return <HasFlag reason={reason} onResolve={resolveFlag} />;
  }

  return <CreateFlag text={text} update={setText} onSubmit={setFlag} />;
}

const flagClasses =
  'inline-flex justify-center self-center border border-transparent bg-red-800 px-4 py-2 font-medium text-white shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2';
const CreateFlag = ({ text, update, onSubmit }) => {
  const [isOpen, { toggle }] = useOpenClosed();

  return (
    <div className="sticky top-4 right-4 z-10 flex justify-end">
      {isOpen && <Reason reason={text} update={update} />}
      {isOpen ? (
        <>
          <button
            type="button"
            className={clsx(flagClasses, 'rounded-l-md')}
            onClick={() => {
              onSubmit();
              toggle();
              update('');
            }}
          >
            Flag
          </button>
          <button
            type="button"
            className="inline-flex justify-center self-center rounded-r-md border border-transparent bg-gray-800 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
            onClick={() => {
              toggle();
              update('');
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <button type="button" className={clsx(flagClasses, 'rounded-md')} onClick={toggle}>
          Flag with Issues
        </button>
      )}
    </div>
  );
};

const HasFlag = ({ reason, onResolve }) => {
  const [isFlagModalOpen, { open: openFlagModal, close: closeFlagModal }] = useOpenClosed();

  return (
    <>
      <ConfirmationModal isOpen={isFlagModalOpen} onYes={onResolve} onClose={closeFlagModal}>
        <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
          Flag Resolution Confirmation
        </Dialog.Title>
        <Dialog.Description className="mt-1">This resolution is for everyone</Dialog.Description>

        <p className="mt-1 text-sm text-gray-500">
          Are you sure you want to resolve the issues with this submission? This action will be visible to everyone.
        </p>
      </ConfirmationModal>
      <div className="relative mb-3 ml-1 max-h-96 overflow-scroll border border-red-800 text-lg font-semibold text-white shadow sm:rounded-md">
        <ExclamationIcon className="absolute top-1 left-1 h-10 w-10 text-red-800" />
        <div className="flex h-full grow justify-between gap-4 bg-red-400 px-4 py-5 sm:p-6">
          <div className="ml-8">{reason}</div>
          <div className="items-end">
            <button type="button" meta="default" onClick={openFlagModal}>
              Resolve
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Reason = ({ reason, update }) => {
  return (
    <section className="mr-4 flex w-64 max-w-xl justify-end rounded border bg-white px-4 py-2 shadow">
      <input
        type="text"
        placeholder="reason for flagging"
        onChange={(event) => update(event.target.value)}
        value={reason}
      />
    </section>
  );
};
