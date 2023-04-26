import { Fragment, useContext, useMemo, useRef } from 'react';
import { List } from 'react-content-loader';
import clsx from 'clsx';
import { Dialog } from '@headlessui/react';
import { useExpanded, useSortBy, useTable } from 'react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  CheckIcon,
  DocumentTextIcon,
  MapPinIcon,
  PencilSquareIcon,
  PlusIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import Tippy, { useSingleton } from '@tippyjs/react/headless';
import { AuthContext } from '../../AuthProvider';
import { ConfirmationModal, Chrome, Header, Link, onRequestError, toast, Tooltip } from '../PageElements';
import { useOpenClosed } from '../Hooks/useOpenClosedHook';
import { wellTypes } from '../../data/lookups';

export function Component({ completeProfile }) {
  const { authInfo } = useContext(AuthContext);
  const siteQuery = useQuery({
    queryKey: ['sites'],
    queryFn: () => ky.get(`/api/sites/mine`).json(),
    enabled: authInfo?.id ? true : false,
    onError: (error) => onRequestError(error, 'We had trouble fetching your sites.'),
  });

  return (
    <main>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Header>
          {completeProfile() ? (
            <div className="mr-2 flex justify-end sm:mr-0">
              <SiteCreationButton className="m-0" access={!completeProfile()} />
            </div>
          ) : (
            <p>
              You must complete your{' '}
              <Link data-style="primary" to="/profile">
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

function CreationButton({ access, url = '/site/create', label = 'Create item', className = 'm-4 text-2xl' }) {
  return (
    <Link to={url} type="button" data-style="primary" disabled={access} className={className}>
      <div className="flex">
        <PlusIcon className="mr-2 h-5 w-5 self-center" />
        <span>{label}</span>
      </div>
    </Link>
  );
}

function SiteCreationButton({ access, className = 'm-4 text-2xl' }) {
  return <CreationButton url="/site/create" label="Create site" access={access} className={className} />;
}

function InventoryCreationButton({ site, access, className = 'm-4 text-2xl' }) {
  return (
    <CreationButton
      url={`/site/${site}/inventory/create`}
      label="Create inventory"
      access={access}
      className={className}
    />
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
      <Link data-style="primary" to="/profile">
        {' '}
        profile{' '}
      </Link>{' '}
      before submitting sites.
    </p>
  );
}

const getStatusProps = (status, row) => {
  const commonClasses = 'uppercase text-xs border px-2 py-1 w-24 text-center rounded font-bold text-white select-none';
  switch (status) {
    case 'incomplete':
      return {
        children: 'draft',
        className: clsx(commonClasses, 'bg-gray-500 border-gray-700'),
      };
    case 'submitted': {
      const { flagged, edocsNumber } = row;
      let label = 'submitted';
      if (flagged) {
        label = 'flagged';
      } else if (edocsNumber) {
        label = edocsNumber;
      }

      return {
        children: label,
        className: clsx(commonClasses, {
          'bg-blue-500 border-blue-700': label === 'submitted',
          'bg-red-500 border-red-700': label === 'flagged',
          'bg-cyan-500 border-cyan-700': label === edocsNumber,
        }),
      };
    }
    case 'authorized': {
      return {
        children: 'approved',
        className: clsx(commonClasses, 'bg-emerald-500 border-emerald-700'),
      };
    }
  }
};

function InventoryStatus({ inventoryId, siteId, status, row }) {
  const { isElevated } = useContext(AuthContext);
  const statusProps = getStatusProps(status, row);

  if (isElevated() && status === 'submitted') {
    return <Link to={`/review/site/${siteId}/inventory/${inventoryId}`} {...statusProps} />;
  }

  return <span {...statusProps} />;
}

function SiteTable({ data }) {
  const [isSiteModalOpen, { open: openSiteModal, close: closeSiteModal }] = useOpenClosed();
  const [isInventoryModalOpen, { open: openInventoryModal, close: closeInventoryModal }] = useOpenClosed();
  const deleteSite = useRef();
  const deleteInventory = useRef();
  const [source, target] = useSingleton();

  const columns = useMemo(
    () => [
      {
        Header: 'Id',
        Cell: function id({ row }) {
          return (
            <div className="flex justify-between">
              {row.isExpanded ? (
                <ChevronDownIcon className="-ml-2 inline h-4 w-4" />
              ) : (
                <ChevronRightIcon className="-ml-2 inline h-4 w-4" />
              )}
              {row.original.id}
            </div>
          );
        },
        SubCell: () => (
          <div className="flex h-full content-center items-center justify-between">
            <div className="mr-2 h-full w-full border-r border-gray-500 bg-gray-200"></div>
          </div>
        ),
      },
      {
        Header: 'Name',
        accessor: 'name',
        SubCell: ({ row }) => <>Order #{row.original.orderNumber}</>,
      },
      {
        id: 'type',
        Header: 'Type',
        accessor: 'naicsTitle',
        SubCell: ({ row }) => {
          return (
            <div className="flex items-center justify-between">
              <div>{wellTypes.find((item) => item.value === row.original.subClass).label}</div>
              <InventoryStatus
                siteId={`${row.original.siteId}`}
                inventoryId={row.original.id}
                status={row.original.status}
                row={row.original}
              />
            </div>
          );
        },
      },
      {
        id: 'status',
        Header: 'Completeness',
        Cell: function status({ row }) {
          return (
            <div className="stroke-2">
              <Tippy content="Site details" singleton={target}>
                <Link
                  to={`/site/${row.original.id}/add-details`}
                  className="relative inline-block h-6 w-6 text-gray-500 hover:text-blue-800"
                >
                  <DocumentTextIcon className="absolute top-2 m-auto h-6 w-6" aria-label="site details" />
                  {row.original.detailStatus ? (
                    <CheckIcon
                      className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-emerald-500"
                      aria-label="yes"
                    />
                  ) : (
                    <XMarkIcon
                      className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-pink-500"
                      aria-label="no"
                    />
                  )}
                </Link>
              </Tippy>
              <Tippy content="Site contacts" singleton={target}>
                <Link
                  to={`/site/${row.original.id}/add-contacts`}
                  className="relative inline-block h-6 w-6 text-gray-500 hover:text-blue-800"
                >
                  <UsersIcon className="absolute top-2 m-auto h-6 w-6" aria-label="site contacts" />
                  {row.original.contactStatus ? (
                    <CheckIcon
                      className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-emerald-500"
                      aria-label="yes"
                    />
                  ) : (
                    <XMarkIcon
                      className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-pink-500"
                      aria-label="no"
                    />
                  )}
                </Link>
              </Tippy>
              <Tippy content="Site location" singleton={target}>
                <Link
                  to={`/site/${row.original.id}/add-location`}
                  className="relative inline-block h-6 w-6 text-gray-500 hover:text-blue-800"
                >
                  <MapPinIcon className="absolute top-2 m-auto h-6 w-6" aria-label="site location" />
                  {row.original.locationStatus ? (
                    <CheckIcon
                      className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-emerald-500"
                      aria-label="yes"
                    />
                  ) : (
                    <XMarkIcon
                      className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-pink-500"
                      aria-label="no"
                    />
                  )}
                </Link>
              </Tippy>
            </div>
          );
        },
        SubCell: ({ row }) => {
          return (
            <div className="stroke-2">
              {row.original.subClass === 5002 && (
                <Tippy content="regulatory contact" singleton={target}>
                  <Link
                    to={`/site/${row.original.siteId}/inventory/${row.original.id}/regulatory-contact`}
                    className="relative inline-block h-6 w-6 text-gray-500 hover:text-blue-800"
                  >
                    <UsersIcon className="absolute top-2 m-auto h-6 w-6" aria-label="regulatory contacts" />
                    {row.original.contactStatus ? (
                      <CheckIcon
                        className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-emerald-500"
                        aria-label="yes"
                      />
                    ) : (
                      <XMarkIcon
                        className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-pink-500"
                        aria-label="no"
                      />
                    )}
                  </Link>
                </Tippy>
              )}
              <Tippy content="well locations" singleton={target}>
                <Link
                  to={`/site/${row.original.siteId}/inventory/${row.original.id}/add-wells`}
                  className="relative inline-block h-6 w-6 text-gray-500 hover:text-blue-800"
                >
                  <MapPinIcon className="absolute top-2 m-auto h-6 w-6" aria-label="well locations" />
                  {row.original.locationStatus ? (
                    <CheckIcon
                      className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-emerald-500"
                      aria-label="yes"
                    />
                  ) : (
                    <XMarkIcon
                      className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-pink-500"
                      aria-label="no"
                    />
                  )}
                </Link>
              </Tippy>
              <Tippy content="well details" singleton={target}>
                <Link
                  to={`/site/${row.original.siteId}/inventory/${row.original.id}/add-well-details`}
                  className="relative inline-block h-6 w-6 text-gray-500 hover:text-blue-800"
                >
                  <DocumentTextIcon className="absolute top-2 m-auto h-6 w-6" aria-label="well details" />
                  {row.original.detailStatus ? (
                    <CheckIcon
                      className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-emerald-500"
                      aria-label="yes"
                    />
                  ) : (
                    <XMarkIcon
                      className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-pink-500"
                      aria-label="no"
                    />
                  )}
                </Link>
              </Tippy>
              <Tippy content="sign and submit" singleton={target}>
                <Link
                  to={`/site/${row.original.siteId}/inventory/${row.original.id}/submit`}
                  className="relative inline-block h-6 w-6 text-gray-500 hover:text-blue-800"
                >
                  <PencilSquareIcon className="absolute top-2 m-auto h-6 w-6" aria-label="signature status" />
                  {row.original.signatureStatus ? (
                    <CheckIcon
                      className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-emerald-500"
                      aria-label="yes"
                    />
                  ) : (
                    <XMarkIcon
                      className="absolute bottom-3 m-auto h-6 w-6 stroke-current text-pink-500"
                      aria-label="no"
                    />
                  )}
                </Link>
              </Tippy>
            </div>
          );
        },
      },
      {
        Header: '',
        id: 'action',
        Cell: function action({ row }) {
          return (
            <TrashIcon
              aria-label="delete site"
              className="ml-1 h-6 w-6 cursor-pointer text-red-600 hover:text-red-900"
              onClick={(event) => {
                event.stopPropagation();

                deleteSite.current = row.original.id;

                openSiteModal();
              }}
            />
          );
        },
        SubCell: function action({ row }) {
          return (
            <TrashIcon
              aria-label="delete inventory"
              className="ml-1 h-6 w-6 cursor-pointer text-red-600 hover:text-red-900"
              onClick={(event) => {
                event.stopPropagation();

                deleteSite.current = row.original.siteId;
                deleteInventory.current = row.original.id;

                openInventoryModal();
              }}
            />
          );
        },
      },
    ],
    [openSiteModal, openInventoryModal, target]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, visibleColumns } = useTable(
    { columns, data },
    useSortBy,
    useExpanded
  );

  const queryClient = useQueryClient();
  const { mutate } = useMutation((siteId) => ky.delete(`/api/site`, { json: { siteId } }), {
    onMutate: async (id) => {
      await queryClient.cancelQueries('sites');
      const previousValue = queryClient.getQueryData('sites');

      queryClient.setQueryData('sites', (old) => old.filter((x) => x.id !== id));
      closeSiteModal();

      return previousValue;
    },
    onSuccess: () => {
      toast.success('Site deleted successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries('sites');
    },
    onError: (error, _, previousValue) => {
      queryClient.setQueryData('sites', previousValue);
      onRequestError(error, 'We had some trouble deleting this site.');
    },
  });

  const { mutate: mutateInventory } = useMutation(
    ({ siteId, inventoryId }) => ky.delete(`/api/inventory`, { json: { siteId, inventoryId } }),
    {
      onMutate: async ({ siteId, inventoryId }) => {
        closeInventoryModal();

        await queryClient.cancelQueries(['site-inventories', siteId]);
        const previousValue = queryClient.getQueryData(['site-inventories', siteId]);

        queryClient.setQueryData(['site-inventories', siteId], (old) => {
          return {
            ...old,
            inventories: old.inventories.filter((x) => x.id !== inventoryId),
          };
        });

        return previousValue;
      },
      onSuccess: () => {
        toast.success('Inventory deleted successfully!');
      },
      onError: (error, variables, previousValue) => {
        queryClient.setQueryData(['site-inventories', variables.siteId], previousValue);
        onRequestError(error, 'We had some trouble deleting this inventory.');
      },
    }
  );

  return data?.length < 1 ? (
    <div className="flex flex-col items-center">
      <Tippy singleton={source} delay={25} render={(attrs, content) => <Tooltip {...attrs}>{content}</Tooltip>} />
      <div className="m-6 rounded-lg border bg-gray-50 px-5 py-4 shadow-sm">
        <h2 className="mb-1 text-xl font-medium">Create your first site</h2>
        <p className="text-gray-700">Get started by clicking the button below to start creating your first site.</p>
        <div className="mb-6 text-center text-sm text-gray-900"></div>
        <div className="flex justify-center">
          <SiteCreationButton className="m-0" />
        </div>
      </div>
    </div>
  ) : (
    <>
      <ConfirmationModal
        isOpen={isSiteModalOpen}
        onYes={() => mutate(deleteSite.current)}
        onClose={() => {
          deleteSite.current = null;

          closeSiteModal();
        }}
      >
        <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">Site Deletion Confirmation</Dialog.Title>
        <Dialog.Description className="mt-1">This site will be permanently deleted</Dialog.Description>

        <p className="mt-1 text-sm text-gray-500">
          Are you sure you want to delete this site? All of your data will be permanently removed. This action cannot be
          undone.
        </p>
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={isInventoryModalOpen}
        onYes={() => mutateInventory({ siteId: deleteSite.current, inventoryId: deleteInventory.current })}
        onClose={() => {
          deleteSite.current = null;
          deleteInventory.current = null;

          closeInventoryModal();
        }}
      >
        <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
          Inventory Deletion Confirmation
        </Dialog.Title>
        <Dialog.Description className="mt-1">This inventory will be permanently deleted</Dialog.Description>

        <p className="mt-1 text-sm text-gray-500">
          Are you sure you want to delete this inventory? All of your data will be permanently removed. This action
          cannot be undone.
        </p>
      </ConfirmationModal>
      <Tippy singleton={source} delay={25} render={(attrs, content) => <Tooltip {...attrs}>{content}</Tooltip>} />
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
              <table {...getTableProps()} className="h-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {headerGroups.map((headerGroup) => (
                    <tr key={headerGroup.index} {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          key={`${headerGroup.index}-${column.id}`}
                          className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          {column.render('Header')}
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <ChevronUpIcon className="ml-2 inline h-5 w-5" />
                            ) : (
                              <ChevronDownIcon className="ml-2 inline h-5 w-5" />
                            )
                          ) : null}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()} className="divide-y divide-gray-200 bg-white">
                  {rows.map((row) => {
                    prepareRow(row);
                    const rowProps = row.getRowProps();
                    const expandProps = row.getToggleRowExpandedProps();

                    return (
                      <Fragment key={rowProps.key}>
                        <tr {...rowProps} {...expandProps}>
                          {row.cells.map((cell) => (
                            <td
                              key={`${row.index}-${cell.column.id}`}
                              className={clsx(
                                {
                                  'font-medium': ['action', 'id'].includes(cell.column.id),
                                  'whitespace-nowrap text-right': cell.column.id === 'action',
                                },
                                'px-3 pb-2 pt-4'
                              )}
                              {...cell.getCellProps()}
                            >
                              <div className="text-sm text-gray-900">{cell.render('Cell')}</div>
                            </td>
                          ))}
                        </tr>
                        {row.isExpanded && (
                          <WellInventorySubTable row={row} rowProps={rowProps} visibleColumns={visibleColumns} />
                        )}
                      </Fragment>
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

function SubRows({ row, rowProps, visibleColumns, data, status }) {
  if (status === 'loading') {
    return (
      <tr>
        <td />
        <td colSpan={visibleColumns.length - 1}>Loading...</td>
      </tr>
    );
  } else if (status === 'error') {
    return (
      <tr>
        <td />
        <td colSpan={visibleColumns.length - 1}>There was a problem finding the inventories for this site</td>
      </tr>
    );
  }

  if (data?.inventories.length < 1) {
    return (
      <tr>
        <td />
        <td colSpan={visibleColumns.length - 1}>
          <div className="flex flex-col items-center">
            <div className="m-6 rounded-lg border bg-gray-50 px-5 py-4 shadow-sm">
              <h2 className="mb-1 text-xl font-medium">Create your first inventory</h2>
              <p className="text-gray-700">
                Get started by clicking the button below to start creating your first inventory.
              </p>
              <div className="mb-6 text-center text-sm text-gray-900"></div>
              <div className="flex justify-center">
                <InventoryCreationButton site={row.original.id} className="m-0" />
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      {data?.inventories.map((x, i) => {
        return (
          <tr {...rowProps} key={`${rowProps.key}-expanded-${i}`}>
            {row.cells.map((cell) => {
              return (
                <td
                  className={clsx('text-sm text-gray-900', {
                    'px-3 pb-1 pt-2': cell.column.id.toLowerCase() !== 'id',
                  })}
                  key={`${row.index}-expanded-${cell.column.id}`}
                  {...cell.getCellProps()}
                >
                  {cell.render(cell.column.SubCell ? 'SubCell' : 'Cell', {
                    value: cell.column.accessor && cell.column.accessor(x, i),
                    row: { ...row, original: x },
                  })}
                </td>
              );
            })}
          </tr>
        );
      })}
      <tr>
        <td colSpan={visibleColumns.length - 1}>
          <div className="flex justify-center">
            <InventoryCreationButton site={row.original.id} className="my-4" />
          </div>
        </td>
      </tr>
    </>
  );
}

function WellInventorySubTable({ row, rowProps, visibleColumns }) {
  const { authInfo } = useContext(AuthContext);
  const wellQuery = useQuery({
    queryKey: ['site-inventories', row.original.id],
    queryFn: () => ky.get(`/api/site/${row.original.id}/inventories`).json(),
    enabled: authInfo?.id ? true : false,
    onError: (error) => onRequestError(error, 'We had trouble fetching the inventories for this site.'),
  });

  return <SubRows row={row} rowProps={rowProps} visibleColumns={visibleColumns} {...wellQuery} />;
}
