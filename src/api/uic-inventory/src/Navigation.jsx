import * as React from 'react';
import { useQuery, useMutation } from 'graphql-hooks'
import clsx from 'clsx';
import { MailOpenIcon, MailIcon, LinkIcon } from '@heroicons/react/outline';

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', hour12: true, hour: 'numeric', minute: 'numeric', });
const HOMEPAGE_QUERY = `query GetAccount {
  accountById(id: 1) {
    firstName
    lastName
    email
    notifications {
      id
      read
      event
      url
      createdAt
    }
  }
}`;

const READ_MUTATION = `mutation MarkAsRead($id: Int!) {
  markAsRead(id: $id) {
    read
    readAt
  }
}`

export function Navigation() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { loading, error, data } = useQuery(HOMEPAGE_QUERY);
  const [readNotification] = useMutation(READ_MUTATION);

  const markAsRead = (id) => {
    readNotification({
      variables: {
        id
      }
    });
  }

  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return 'Something Bad Happened';
  }

  const notificationColors = clsx('h-6', 'w-6', {
    'text-yellow-400': data.accountById.notifications.length,
  });

  const hoverClasses = clsx(['max-h-48', 'overflow-scroll', 'origin-top-right', 'absolute', 'right-0', 'mt-2', 'w-80', 'rounded-md', 'shadow-lg', 'py-1', 'bg-white', 'ring-1', 'ring-black', 'ring-opacity-5', 'focus:outline-none'], {
    'hidden': !menuOpen
  });

  return (<nav className="bg-gray-800">
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div className="relative flex items-center justify-between h-16">
        <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
          <div className="flex-shrink-0 flex items-center">
            <img className="block lg:hidden h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Workflow" />
            <img className="hidden lg:block h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg" alt="Workflow" />
          </div>
          <div className="hidden sm:block sm:ml-6">
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium" aria-current="page">Dashboard</a>
              <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Team</a>
              <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Projects</a>
              <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Calendar</a>
            </div>
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <button className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            onClick={() => {
              setMenuOpen(!menuOpen);
            }} >
            <span className="sr-only">View notifications</span>
            <svg className={notificationColors} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="ml-3 relative">
            <div>
              <button type="button" className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" id="user-menu" aria-expanded="false" aria-haspopup="true">
                <span className="sr-only">Open user menu</span>
                <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
              </button>
            </div>

            <div className={hoverClasses} role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
              {data.accountById.notifications.map(notification => (<div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                <span className="text-gray-400 text-xs">{dateFormatter.format(Date.parse(notification.createdAt))}</span> <span>{notification.event === 'NEW_USER_ACCOUNT_REGISTRATION' ? 'A new user registered!' : 'Other'}</span>
                <span>{!notification.read ? (<MailIcon className="ml-1 h-5 w-5 text-blue-yellow-400 inline-block" onClick={() => markAsRead(notification.id)} />) : (<MailOpenIcon className="ml-1 h-5 w-5 text-gray-400 inline-block" />)}</span>
                <a href={notification.url} key={notification.id}>
                  <LinkIcon className="ml-1 h-5 w-5 text-blue-blue-400 inline-block" />
                </a>
              </div>))}
            </div>

          </div>
        </div>
      </div>
    </div>

    <div className="sm:hidden" id="mobile-menu">
      <div className="px-2 pt-2 pb-3 space-y-1">
        <a href="#" className="bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium" aria-current="page">Dashboard</a>
        <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Team</a>
        <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Projects</a>
        <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Calendar</a>
      </div>
    </div>
  </nav>);
}

export default Navigation;
