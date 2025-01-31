import { ChevronDownIcon, ChevronUpIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import clsx from 'clsx';
import ky from 'ky';
import { useContext, useMemo } from 'react';
import { BulletList } from 'react-content-loader';
import { AuthContext } from '../../../AuthContext';
import { Chrome, onRequestError, useNavigate } from '../../PageElements';

export function Component() {
  const { authInfo } = useContext(AuthContext);

  const { data, status } = useQuery({
    queryKey: ['all-accounts'],
    queryFn: () => ky.get('/api/accounts').json(),
    enabled: authInfo?.id ? true : false,
    onError: (error) => onRequestError(error, 'We had trouble fetching your sites.'),
  });

  return (
    <>
      <Chrome title="Utah UIC Well Inventory Registered Users">
        {status === 'pending' ? <BulletList height={240} /> : <UserTable accounts={data?.accounts} />}
      </Chrome>
    </>
  );
}

const UserTable = ({ accounts = [] }) => {
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
      },
      {
        header: 'First',
        accessorKey: 'firstName',
      },
      {
        header: 'Last',
        accessorKey: 'lastName',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Access',
        accessorKey: 'access',
      },
      {
        header: 'Profile',
        id: 'action',
        cell: function action({ row }) {
          return (
            <UserCircleIcon
              aria-label="view account"
              className="ml-1 h-6 w-6 cursor-pointer text-gray-500 hover:text-blue-800"
              onClick={(event) => {
                event.stopPropagation();

                navigate(`/account/${row.original.id}/profile`);
              }}
            />
          );
        },
      },
    ],
    [navigate],
  );

  const table = useReactTable({
    columns,
    data: accounts,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility: {
        id: false,
      },
    },
  });

  return (
    <table className="w-full divide-y divide-gray-200 overflow-auto border">
      <thead className="bg-gray-50">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className={clsx(
                  {
                    'cursor-pointer select-none': header.column.getCanSort(),
                  },
                  'px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500',
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

      <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-900">
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="cursor-default hover:bg-blue-100">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                <div className="px-3 py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
