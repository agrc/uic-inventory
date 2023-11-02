import { ChevronDownIcon, ChevronUpIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { useContext, useMemo } from 'react';
import { BulletList } from 'react-content-loader';
import { useSortBy, useTable } from 'react-table';
import { AuthContext } from '../../../AuthProvider';
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
        accessor: 'id',
      },
      {
        Header: 'First',
        accessor: 'firstName',
      },
      {
        Header: 'Last',
        accessor: 'lastName',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Access',
        accessor: 'access',
      },
      {
        Header: 'Profile',
        id: 'action',
        Cell: function action({ row }) {
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

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: accounts,
      initialState: {
        hiddenColumns: ['id'],
      },
    },
    useSortBy,
  );

  return (
    <table {...getTableProps()} className="w-full divide-y divide-gray-200 overflow-auto border">
      <thead className="bg-gray-50">
        {headerGroups.map((headerGroup) => (
          // eslint-disable-next-line react/jsx-key
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              // eslint-disable-next-line react/jsx-key
              <th
                {...column.getHeaderProps(column.getSortByToggleProps())}
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
      <tbody {...getTableBodyProps()} className="divide-y divide-gray-200 bg-white text-sm text-gray-900">
        {rows.map((row) => {
          prepareRow(row);

          return (
            // eslint-disable-next-line react/jsx-key
            <tr className="cursor-default hover:bg-blue-100" {...row.getRowProps()}>
              {row.cells.map((cell) => (
                // eslint-disable-next-line react/jsx-key
                <td {...cell.getCellProps()}>
                  <div className="px-3 py-2">{cell.render('Cell')}</div>
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
