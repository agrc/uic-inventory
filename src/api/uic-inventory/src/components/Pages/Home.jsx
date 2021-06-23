import { List } from 'react-content-loader';
import { AuthContext } from '../../AuthProvider';
import { useQuery, SitesQuery } from '../GraphQL';
import { Chrome, Link, Header } from '../PageElements';
import { useContext } from 'react';

export function SitesAndInventory({ completeProfile }) {
  const { authInfo } = useContext(AuthContext);
  const siteQuery = useQuery(SitesQuery, { variables: { id: parseInt(authInfo.id) } });

  return (
    <main>
      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Header>
          {completeProfile() ? (
            <div className="flex justify-end">
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
          <div className="self-center w-full text-center">
            <SiteCreationButton access={!completeProfile()} />
          </div>
        </Chrome>
      </div>
    </main>
  );
}

export function GenericLandingPage() {
  return (
    <main>
      <Chrome title="Utah UIC Class V Injection Well Inventory">
        <p className="text-lg">
          As of August 15, 2021 all Class V injection well inventory information forms must be submitted via online web
          form. To submit, you must first create a Utah ID account and provide UIC user profile information. Please
          visit{' '}
          <a type="Primary" href="https://login.utah.gov">
            Utah ID
          </a>{' '}
          to register with Utah ID and then return to this page to login and complete your profile. If you already have
          a Utah ID account you may login using the link above. Once you have an account you will be able to:
          <ul role="list" className="mt-3 ml-8 list-disc list-inside">
            <li>Submit Class V UIC inventory information forms</li>
            <li>Check inventory form status</li>
            <li>Update well operating status</li>
            <li>Add new wells to existing facilities</li>
            <li>View previous authorizations</li>
          </ul>
        </p>
      </Chrome>
    </main>
  );
}

function SiteCreationButton({ access, className = 'm-4 text-2xl' }) {
  return (
    <Link to="/site/create" type="button" disabled={access} className={className}>
      Add site
    </Link>
  );
}

function SiteList({ show, loading, error, data }) {
  return show ? (
    loading ? (
      <List animate={false} />
    ) : (
      <SiteTable data={data?.mySites} />
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
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Id
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.length > 0 ? (
                  data.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.id}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-sm text-gray-900">{item.naicsTitle}</div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-sm text-gray-900">Incomplete</div>
                      </td>
                      <td className="px-3 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <Link to={`/site/${item.id}/add-contacts`} className="text-indigo-600 hover:text-indigo-900">
                          Continue
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 py-4">
                      <div className="text-sm text-center text-gray-900">No sites have been created yet</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
