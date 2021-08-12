import { Fragment, useContext, useMemo, useRef } from 'react';
import { List } from 'react-content-loader';
import clsx from 'clsx';
import { Dialog, Transition } from '@headlessui/react';
import { useSortBy, useTable } from 'react-table';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import ky from 'ky';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/outline';
import { DocumentTextIcon, LocationMarkerIcon, PlusIcon, UsersIcon, XIcon, CheckIcon } from '@heroicons/react/solid';
import { AuthContext } from '../../AuthProvider';
import { Chrome, Header, Link, onRequestError, toast } from '../PageElements';
import { useOpenClosed } from '../Hooks/useOpenClosedHook';

export function SitesAndInventory({ completeProfile }) {
  const { authInfo } = useContext(AuthContext);
  const siteQuery = useQuery('sites', () => ky.get(`/api/sites/mine`).json(), {
    enabled: authInfo?.id ? true : false,
    onError: (error) => onRequestError(error, 'We had trouble fetching your sites.'),
  });

  return (
    <main>
      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Header>
          {completeProfile() ? (
            <div className="flex justify-end mr-2 sm:mr-0">
              <SiteCreationButton className="m-0" access={!completeProfile()} />
            </div>
          ) : (
            <p>
              You must complete your{' '}
              <Link type="primary" to="/profile">
                profile
              </Link>{' '}
              before submitting sites.
            </p>
          )}
        </Header>
        <Chrome title="Your sites and inventory">
          <div className="w-full">
            <SiteList show={completeProfile()} {...siteQuery} />
          </div>
        </Chrome>
      </div>
    </main>
  );
}

export function GenericLandingPage() {
  return (
    <main className="text-lg">
      <Chrome title="Utah UIC Class V Injection Well Inventory">
        <p>
          As of August 15, 2021 all Class V injection well inventory information forms must be submitted via online web
          form. To submit, you must first create a Utah ID account and provide UIC user profile information. Please
          visit{' '}
          <a type="primary" href="/api/login">
            Utah ID
          </a>{' '}
          to register with Utah ID and then return to this page to login and complete your profile. If you already have
          a Utah ID account you may login using the link above. Once you have an account you will be able to:
        </p>
        <ul className="mt-3 ml-8 list-disc list-inside">
          <li>Submit Class V UIC inventory information forms</li>
          <li>Check inventory form status</li>
          <li>Update well operating status</li>
          <li>Add new wells to existing facilities</li>
          <li>View previous authorizations</li>
        </ul>
      </Chrome>
    </main>
  );
}

function SiteCreationButton({ access, className = 'm-4 text-2xl' }) {
  return (
    <Link to="/site/create" type="button" disabled={access} className={className}>
      <div className="flex">
        <PlusIcon className="self-center w-5 h-5 mr-2" />
        <span>Create site</span>
      </div>
    </Link>
  );
}

function SiteList({ show, status, data }) {
  return show ? (
    status === 'loading' ? (
      <List animate={false} />
    ) : (
      <SiteTable data={data} />
    )
  ) : (
    <p>
      You must complete your{' '}
      <Link type="primary" to="/profile">
        {' '}
        profile{' '}
      </Link>{' '}
      before submitting sites.
    </p>
  );
}

function SiteTable({ data }) {
  const [isOpen, { open, close }] = useOpenClosed();
  const deleteSite = useRef();
  const columns = useMemo(
    () => [
      {
        Header: 'Id',
        accessor: 'id',
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        id: 'type',
        Header: 'Type',
        accessor: 'naicsTitle',
      },
      {
        id: 'status',
        Header: 'Completeness',
        Cell: function status(data) {
          return (
            <div className="stroke-2">
              <Link
                to={`/site/${data.row.original.id}/add-details`}
                className="relative inline-block w-6 h-6 text-gray-500 hover:text-blue-800"
              >
                <DocumentTextIcon className="absolute w-6 h-6 m-auto top-2" aria-label="site details" />
                {data.row.original.detailStatus ? (
                  <CheckIcon className="absolute w-6 h-6 m-auto text-green-500 stroke-current bottom-3" />
                ) : (
                  <XIcon className="absolute w-6 h-6 m-auto text-pink-500 stroke-current bottom-3" />
                )}
              </Link>
              <Link
                to={`/site/${data.row.original.id}/add-contacts`}
                className="relative inline-block w-6 h-6 text-gray-500 hover:text-blue-800"
              >
                <UsersIcon className="absolute w-6 h-6 m-auto top-2" aria-label="site contacts" />
                {data.row.original.contactStatus ? (
                  <CheckIcon className="absolute w-6 h-6 m-auto text-green-500 stroke-current bottom-3" />
                ) : (
                  <XIcon className="absolute w-6 h-6 m-auto text-pink-500 stroke-current bottom-3" />
                )}
              </Link>
              <Link
                to={`/site/${data.row.original.id}/add-location`}
                className="relative inline-block w-6 h-6 text-gray-500 hover:text-blue-800"
              >
                <LocationMarkerIcon className="absolute w-6 h-6 m-auto top-2" aria-label="site location" />
                {data.row.original.locationStatus ? (
                  <CheckIcon className="absolute w-6 h-6 m-auto text-green-500 stroke-current bottom-3" />
                ) : (
                  <XIcon className="absolute w-6 h-6 m-auto text-pink-500 stroke-current bottom-3" />
                )}
              </Link>
            </div>
          );
        },
      },
      {
        Header: '',
        id: 'action',
        Cell: function action(data) {
          return (
            <TrashIcon
              aria-label="delete site"
              className="w-6 h-6 ml-1 text-red-600 cursor-pointer hover:text-red-900"
              onClick={() => {
                open();
                deleteSite.current = data.row.original.id;
              }}
            />
          );
        },
      },
    ],
    [open]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data }, useSortBy);

  const queryClient = useQueryClient();
  const { mutate } = useMutation((siteId) => ky.delete(`/api/site`, { json: { siteId } }), {
    onMutate: async (id) => {
      await queryClient.cancelQueries('sites');
      const previousValue = queryClient.getQueryData('sites');

      queryClient.setQueryData('sites', (old) => old.filter((x) => x.id !== id));
      close();

      return previousValue;
    },
    onSuccess: () => {
      toast.success('Site deleted successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries('sites');
    },
    onError: (error, variables, previousValue) => {
      queryClient.setQueryData('sites', previousValue);
      onRequestError(error, 'We had some trouble deleting this site.');
    },
  });

  return data?.length < 1 ? (
    <div className="flex flex-col items-center">
      <div className="px-5 py-4 m-6 border rounded-lg shadow-sm bg-gray-50">
        <h2 className="mb-1 text-xl font-medium">Create your first site</h2>
        <p className="text-gray-700">Get started by clicking the button below to start creating your first site.</p>
        <div className="mb-6 text-sm text-center text-gray-900"></div>
        <div className="flex justify-center">
          <SiteCreationButton className="m-0" />
        </div>
      </div>
    </div>
  ) : (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          open={isOpen}
          onClose={() => {
            close();
            deleteSite.current = null;
          }}
          className="fixed inset-0 z-10 overflow-y-auto"
        >
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

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 mx-auto my-48 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                  Site Deletion Confirmation
                </Dialog.Title>
                <Dialog.Description className="mt-1">This site will be permanently deleted</Dialog.Description>

                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete this site? All of your data will be permanently removed. This action
                  cannot be undone.
                </p>

                <div className="flex justify-around mt-6">
                  <button type="button" className="bg-indigo-900" onClick={() => mutate(deleteSite.current)}>
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      deleteSite.current = null;
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
              <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {headerGroups.map((headerGroup) => (
                    <tr key={headerGroup.index} {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          key={`${headerGroup.index}-${column.id}`}
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                          {column.render('Header')}
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <ChevronUpIcon className="inline w-5 h-5 ml-2" />
                            ) : (
                              <ChevronDownIcon className="inline w-5 h-5 ml-2" />
                            )
                          ) : null}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
                  {rows.map((row) => {
                    prepareRow(row);

                    return (
                      <tr key={`${row.index}`} {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <td
                            key={`${row.index}-${cell.column.id}`}
                            className={clsx(
                              {
                                'font-medium': ['action', 'id'].includes(cell.column.id),
                                'text-right whitespace-nowrap': cell.column.id === 'action',
                              },
                              'px-3 py-4'
                            )}
                            {...cell.getCellProps()}
                          >
                            <div className="text-sm text-gray-900">{cell.render('Cell')}</div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
