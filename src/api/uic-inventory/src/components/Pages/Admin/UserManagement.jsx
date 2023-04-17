import { useContext, useMemo } from 'react';
import { useQuery } from 'react-query';
import ky from 'ky';
import { useTable, useSortBy } from 'react-table';
import { ChevronDownIcon, ChevronUpIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../../../AuthProvider';
import { Chrome, onRequestError, useHistory } from '../../PageElements';

export default function UserManagement() {
  const { authInfo } = useContext(AuthContext);

  const { data } = useQuery('all-accounts', () => ky.get('/api/accounts').json(), {
    enabled: authInfo?.id ? true : false,
    onError: (error) => onRequestError(error, 'We had trouble fetching your sites.'),
  });

  return (
    <>
      <Chrome title="Inventory Review">
        <UserTable accounts={data?.accounts} />
      </Chrome>
    </>
  );
}

const UserTable = ({ accounts = [] }) => {
  const history = useHistory();

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

                history.push(`/account/${row.original.id}/profile`);
              }}
            />
          );
        },
      },
    ],
    [history]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: accounts,
      initialState: {
        hiddenColumns: ['id'],
      },
    },
    useSortBy
  );

  return (
    <table {...getTableProps()} className="w-full divide-y divide-gray-200 overflow-auto border">
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
      <tbody {...getTableBodyProps()} className="divide-y divide-gray-200 bg-white text-sm text-gray-900">
        {rows.map((row) => {
          prepareRow(row);

          return (
            <tr className="cursor-default hover:bg-blue-100" key={`${row.index}`} {...row.getRowProps()}>
              {row.cells.map((cell) => (
                <td key={`${row.index}-${cell.column.id}`} {...cell.getCellProps()}>
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
