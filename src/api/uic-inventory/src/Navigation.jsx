import { useQuery, useMutation } from 'graphql-hooks'
import clsx from 'clsx';
import { MailOpenIcon, MailIcon, LinkIcon, TrashIcon } from '@heroicons/react/outline';

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', hour12: true, hour: 'numeric', minute: 'numeric', });
const HOMEPAGE_QUERY = `query GetAccount {
  accountById(id: 1) {
    firstName
    lastName
    email
    notifications {
      id
      event
      url
      createdAt
      read
      readAt
      deleted
    }
  }
}`;

const UPDATE_MUTATION = `mutation updateNotification($input: NotificationInput!) {
  updateNotification(input: $input) {
    read
    readAt
  }
}`

export function Navigation() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { loading, error, data, refetch } = useQuery(HOMEPAGE_QUERY);
  const [updateNotification] = useMutation(UPDATE_MUTATION);

  const _updateNotification = async (options) => {
    const { error } = await updateNotification(options);

    if (!error) {
      refetch();
    }
  }

  const markAsRead = async (id) => {
    await _updateNotification({
      variables: {
        input: {
          id: id,
          read: true
        }
      }
    });
  }

  const markAsDeleted = async (id) => {
    await _updateNotification({
      variables: {
        input: {
          id: id,
          deleted: true
        }
      }
    });
  }

  const notificationColors = clsx('h-6', 'w-6', {
    'text-yellow-400': !loading && !error && data.accountById.notifications.filter(x => !x.deleted || !x.read).length,
    'text-gray-300': loading,
    'text-red-400': error
  });

  const hoverClasses = clsx(['max-h-48', 'overflow-scroll', 'origin-top-right', 'absolute', 'right-0', 'mt-2', 'w-96', 'rounded-md', 'shadow-lg', 'py-1', 'bg-white', 'ring-1', 'ring-black', 'ring-opacity-5', 'focus:outline-none'], {
    'hidden': !menuOpen
  });

  return (<nav className="bg-gray-800">
    <div className="px-2 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="relative flex items-center justify-between h-16">
        <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <button type="button" className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg className="hidden w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-center flex-1 sm:items-stretch sm:justify-start">
          <div className="flex items-center flex-shrink-0">
            <img className="block w-auto h-8 lg:hidden" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Workflow" />
            <img className="hidden w-auto h-8 lg:block" src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg" alt="Workflow" />
          </div>
          <div className="hidden sm:block sm:ml-6">
            <div className="flex space-x-4">
              <a href="#" className="px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md" aria-current="page">Dashboard</a>
              <a href="#" className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">Team</a>
              <a href="#" className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">Projects</a>
              <a href="#" className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">Calendar</a>
            </div>
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <button className="p-1 text-gray-400 bg-gray-800 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            onClick={() => {
              setMenuOpen(!menuOpen);
            }}>
            <span className="sr-only">View notifications</span>
            <svg className={notificationColors} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="relative ml-3">
            <div>
              <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" id="user-menu" aria-expanded="false" aria-haspopup="true">
                <span className="sr-only">Open user menu</span>
                <img className="w-8 h-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
              </button>
            </div>

            <div className={hoverClasses} role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
              {!loading && !error && data.accountById.notifications
                .filter(notification => !notification.deleted)
                .map(notification => (
                <div key={notification.id} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                  <span className="text-xs text-gray-400">{dateFormatter.format(Date.parse(notification.createdAt))}</span> <span>{notification.event === 'NEW_USER_ACCOUNT_REGISTRATION' ? 'A new user registered!' : 'Other'}</span>
                  {notification.read ?
                    (
                      <span alt={"Read at: " + dateFormatter.format(Date.parse(notification.readAt))} title={"Read at: " + dateFormatter.format(Date.parse(notification.readAt))}>
                        <MailOpenIcon className="inline-block w-5 h-5 ml-1 text-gray-400" />
                      </span>
                    ) :
                    (
                      <span>
                        <MailIcon className="inline-block w-5 h-5 ml-1 text-blue-400" onClick={() => markAsRead(notification.id)} />
                      </span>
                    )}
                  <a href={notification.url}>
                    <LinkIcon className="inline-block w-5 h-5 ml-1 text-blue-400" />
                  </a>
                    <TrashIcon className="inline-block w-5 h-5 ml-1 text-red-300" onClick={() => markAsDeleted(notification.id)} />
                </div>
                ))}
              {!loading && !error && data.accountById.notifications
                .filter(notification => !notification.deleted).length === 0 ? <div className="flex flex-col items-center justify-center h-16 text-gray-500"><h3 className="text-xl font-bold">All caught up!</h3><p className="text-sm">Take a break, go for a walk, be your best you.</p></div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="sm:hidden" id="mobile-menu">
      <div className="px-2 pt-2 pb-3 space-y-1">
        <a href="#" className="block px-3 py-2 text-base font-medium text-white bg-gray-900 rounded-md" aria-current="page">Dashboard</a>
        <a href="#" className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">Team</a>
        <a href="#" className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">Projects</a>
        <a href="#" className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">Calendar</a>
      </div>
    </div>
  </nav>);
}

export default Navigation;
