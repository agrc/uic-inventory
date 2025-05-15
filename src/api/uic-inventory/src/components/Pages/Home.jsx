import { Description, DialogTitle } from '@headlessui/react';
import {
  CheckIcon,
  DocumentTextIcon,
  MapPinIcon,
  PencilSquareIcon,
  PlusIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Tippy, { useSingleton } from '@tippyjs/react/headless';
import { useOpenClosed } from '@ugrc/utilities/hooks';
import clsx from 'clsx';
import ky from 'ky';
import PropTypes from 'prop-types';
import { Fragment, useContext, useMemo, useRef } from 'react';
import { List } from 'react-content-loader';
import { AuthContext } from '../../AuthContext';
import { wellTypes } from '../../data/lookups';
import { Chrome, ConfirmationModal, Header, Link, TableLoader, Tooltip, onRequestError, toast } from '../PageElements';

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
              <Link data-style="link" to="/profile">
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
Component.propTypes = {
  completeProfile: PropTypes.func,
};

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
CreationButton.propTypes = {
  access: PropTypes.bool,
  url: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
};

function SiteCreationButton({ access, className = 'm-4 text-2xl' }) {
  return <CreationButton url="/site/create" label="Create site" access={access} className={className} />;
}
SiteCreationButton.propTypes = {
  access: PropTypes.bool,
  className: PropTypes.string,
};

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
InventoryCreationButton.propTypes = {
  site: PropTypes.number,
  access: PropTypes.bool,
  className: PropTypes.string,
};

function SiteList({ show, status, data }) {
  return show ? (
    status === 'pending' ? (
      <List animate={false} />
    ) : (
      <SiteTable data={data} />
    )
  ) : (
    <p>
      You must complete your{' '}
      <Link data-style="link" to="/profile">
        {' '}
        profile{' '}
      </Link>{' '}
      before submitting sites.
    </p>
  );
}
SiteList.propTypes = {
  show: PropTypes.bool,
  status: PropTypes.string,
  data: PropTypes.array,
};

const getStatusProps = (status, row) => {
  const commonClasses = 'uppercase text-xs border px-2 py-1 w-24 text-center rounded font-bold text-white select-none';
  switch (status) {
    case 'incomplete':
      return {
        children: 'draft',
        className: clsx(commonClasses, 'border-gray-700 bg-gray-500'),
      };
    case 'submitted': {
      const { flagged } = row;
      let label = 'submitted';
      if (flagged) {
        label = 'flagged';
      }

      return {
        children: label,
        className: clsx(commonClasses, {
          'border-blue-700 bg-blue-500': label === 'submitted',
          'border-red-700 bg-red-500': label === 'flagged',
        }),
      };
    }
    case 'underReview': {
      const { flagged } = row;
      let label = 'under review';
      if (flagged) {
        label = 'flagged';
      }

      return {
        children: label,
        className: clsx(commonClasses, {
          'border-amber-700 bg-amber-500': label === 'under review',
          'border-red-700 bg-red-500': label === 'flagged',
        }),
      };
    }
    case 'approved': {
      return {
        children: 'approved',
        className: clsx(commonClasses, 'border-fuchsia-700 bg-fuchsia-500'),
      };
    }
    case 'authorized': {
      return {
        children: 'authorized',
        className: clsx(commonClasses, 'border-emerald-700 bg-emerald-500'),
      };
    }
    case 'rejected': {
      return {
        children: 'rejected',
        className: clsx(commonClasses, 'border-rose-700 bg-rose-500'),
      };
    }
    case 'completed': {
      return {
        children: 'completed',
        className: clsx(commonClasses, 'border-sky-700 bg-sky-500'),
      };
    }
  }
};

function InventoryStatus({ inventoryId, siteId, status, row }) {
  const { isElevated } = useContext(AuthContext);
  const statusProps = getStatusProps(status, row);

  if (isElevated()) {
    return <Link to={`/review/site/${siteId}/inventory/${inventoryId}`} {...statusProps} />;
  }

  return <span {...statusProps} />;
}
InventoryStatus.propTypes = {
  inventoryId: PropTypes.number,
  siteId: PropTypes.string,
  status: PropTypes.string,
  row: PropTypes.object,
};

function SiteTable({ data }) {
  const [isSiteModalOpen, { open: openSiteModal, close: closeSiteModal }] = useOpenClosed();
  const [isInventoryModalOpen, { open: openInventoryModal, close: closeInventoryModal }] = useOpenClosed();
  const deleteSite = useRef();
  const deleteInventory = useRef();
  const [source, target] = useSingleton();

  const columns = useMemo(
    () => [
      {
        header: 'Id',
        accessorKey: 'id',
        cell: function id({ row }) {
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
        subCell: () => (
          <div className="flex h-full content-center items-center justify-between">
            <div className="mr-2 h-full w-full border-r border-gray-500 bg-gray-200"></div>
          </div>
        ),
        enableSorting: true,
        sortingFn: 'alphanumeric',
      },
      {
        header: 'Name',
        accessorKey: 'name',
        enableSorting: true,
        subCell: ({ row }) => <>Order #{row.original.orderNumber}</>,
      },
      {
        id: 'type',
        header: 'Type',
        enableSorting: true,
        accessorKey: 'naicsTitle',
        subCell: ({ row }) => {
          return (
            <div className="flex items-center justify-between">
              <div>{wellTypes.find((item) => item.value === row.original.subClass).label}</div>
              <InventoryStatus
                siteId={`${row.original.siteId}`}
                inventoryId={row.original.id}
                status={row.original.status}
                row={row}
              />
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Completeness',
        enableSorting: false,
        cell: function status({ row }) {
          return (
            <div className="stroke-2">
              <Tippy content="Site details" singleton={target}>
                <Link
                  to={`/site/${row.original.id}/add-details`}
                  className="relative inline-block h-6 w-6 text-gray-500 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
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
        subCell: ({ row }) => {
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
        header: '',
        id: 'action',
        enableSorting: false,
        cell: function action({ row }) {
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
        subCell: function action({ row }) {
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
    [openSiteModal, openInventoryModal, target],
  );

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          id: 'id',
          desc: true,
        },
      ],
    },
  });

  const queryKey = ['sites'];
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (siteId) => ky.delete(`/api/site`, { json: { siteId } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousValue = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => old.filter((x) => x.id !== id));
      closeSiteModal();

      return { previousValue };
    },
    onSuccess: () => {
      toast.success('Site deleted successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.removeQueries({ queryKey: ['site', deleteSite.current] });
      queryClient.removeQueries({ queryKey: ['site-inventories', deleteSite.current] });
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context.previousValue);
      onRequestError(error, 'We had some trouble deleting this site.');
    },
  });

  const { mutate: mutateInventory } = useMutation({
    mutationFn: ({ siteId, inventoryId }) => ky.delete(`/api/inventory`, { json: { siteId, inventoryId } }),
    onMutate: async ({ siteId, inventoryId }) => {
      closeInventoryModal();

      await queryClient.cancelQueries({
        queryKey: ['site-inventories', siteId],
      });
      const previousValue = queryClient.getQueryData(['site-inventories', siteId]);

      queryClient.setQueryData(['site-inventories', siteId], (old) => {
        return {
          ...old,
          inventories: old.inventories.filter((x) => x.id !== inventoryId),
        };
      });

      return { previousValue };
    },
    onSuccess: () => {
      toast.success('Inventory deleted successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['site-inventories', deleteSite.current] });
      queryClient.removeQueries({ queryKey: ['site', deleteSite.current, 'inventory', deleteInventory.current] });
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['site-inventories', variables.siteId], context.previousValue);
      onRequestError(error, 'We had some trouble deleting this inventory.');
    },
  });

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
        <DialogTitle className="text-lg font-medium leading-6 text-gray-900">Site Deletion Confirmation</DialogTitle>
        <Description className="mt-1">This site will be permanently deleted</Description>

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
        <DialogTitle className="text-lg font-medium leading-6 text-gray-900">
          Inventory Deletion Confirmation
        </DialogTitle>
        <Description className="mt-1">This inventory will be permanently deleted</Description>

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
              <table className="h-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className={clsx(
                            { 'cursor-pointer': header.column.getCanSort() },
                            'select-none px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500',
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          title={
                            header.column.getCanSort()
                              ? header.column.getNextSortingOrder() === 'asc'
                                ? 'Sort ascending'
                                : header.column.getNextSortingOrder() === 'desc'
                                  ? 'Sort descending'
                                  : 'Clear sort'
                              : undefined
                          }
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronDownIcon className="ml-2 inline size-3" />,
                            desc: <ChevronUpIcon className="ml-2 inline size-3" />,
                          }[header.column.getIsSorted()] ?? null}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {table.getRowModel().rows.map((row) => (
                    <Fragment key={row.id}>
                      <tr
                        {...{
                          onClick: () => row.toggleExpanded(),
                          onKeyDown: row.getToggleExpandedHandler(),
                          style: { cursor: 'pointer' },
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={clsx(
                              {
                                'font-medium': ['action', 'id'].includes(cell.column.id),
                                'whitespace-nowrap text-right': cell.column.id === 'action',
                              },
                              'px-3 pb-2 pt-4',
                            )}
                          >
                            <div className="text-sm text-gray-900">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </td>
                        ))}
                      </tr>
                      {row.getIsExpanded() && (
                        <WellInventorySubTable row={row} visibleColumns={table.getAllColumns().length} />
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
SiteTable.propTypes = {
  data: PropTypes.array,
};

function SubRows({ row, data, status, visibleColumns }) {
  if (status === 'pending') {
    return (
      <tr>
        <td colSpan={visibleColumns - 1}>
          <TableLoader className="ml-14" />
          <div className="flex justify-center">
            <InventoryCreationButton site={row.original.id} className="my-4" />
          </div>
        </td>
      </tr>
    );
  } else if (status === 'error') {
    return (
      <tr>
        <td />
        <td colSpan={visibleColumns - 1} className="p-4 text-red-500">
          There was a problem finding the inventories for this site.
        </td>
      </tr>
    );
  }

  if (data?.inventories.length < 1) {
    return (
      <tr>
        <td />
        <td colSpan={visibleColumns - 1}>
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
      {data?.inventories.map((inventory, i) => {
        return (
          <tr key={`${row.id}-expanded-${i}`}>
            {row.getVisibleCells().map((cell) => {
              return (
                <td
                  className={clsx('text-sm text-gray-900', {
                    'px-3 pb-1 pt-2': cell.column.id.toLowerCase() !== 'id',
                  })}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.subCell, { row: { ...row, original: inventory } })}
                </td>
              );
            })}
          </tr>
        );
      })}
      <tr>
        <td colSpan={visibleColumns - 1}>
          <div className="flex justify-center">
            <InventoryCreationButton site={row.original.id} className="my-4" />
          </div>
        </td>
      </tr>
    </>
  );
}
SubRows.propTypes = {
  row: PropTypes.object,
  visibleColumns: PropTypes.number,
  data: PropTypes.object,
  status: PropTypes.string,
};

function WellInventorySubTable({ row, visibleColumns }) {
  const { authInfo } = useContext(AuthContext);
  const { data, status } = useQuery({
    queryKey: ['site-inventories', row.original.id],
    queryFn: () => ky.get(`/api/site/${row.original.id}/inventories`).json(),
    enabled: authInfo?.id ? true : false,
    onError: (error) => onRequestError(error, 'We had trouble fetching the inventories for this site.'),
  });

  return <SubRows row={row} visibleColumns={visibleColumns} data={data} status={status} />;
}
WellInventorySubTable.propTypes = {
  row: PropTypes.object,
  visibleColumns: PropTypes.number,
};
