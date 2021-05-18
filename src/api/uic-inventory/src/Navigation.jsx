import { useManualQuery, useMutation } from 'graphql-hooks';
import clsx from 'clsx';
import { BellIcon, LinkIcon, MailOpenIcon, MailIcon, MenuIcon, TrashIcon, XIcon } from '@heroicons/react/outline';
import { Disclosure, Menu, Popover, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { Facebook } from 'react-content-loader';
import { AuthContext } from './AuthProvider';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
  hour12: true,
  hour: 'numeric',
  minute: 'numeric',
});

const NOTIFICATION_QUERY = `query GetAccount($id: Int!) {
  accountById(id: $id) {
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
      additionalData
    }
  }
}`;

const UPDATE_MUTATION = `mutation updateNotification($input: NotificationInput!) {
  updateNotification(input: $input) {
    read
    readAt
  }
}`;

const navigation = [
  {
    text: 'Sites',
    to: '/',
    key: 1,
  },
  {
    text: 'Contact us',
    to: '/contact',
    key: 2,
  },
];

const profile = [
  { text: 'Your Profile', to: '/profile', clientSide: true, key: 1 },
  { text: 'Sign out', to: '/api/logout', clientSide: false, key: 2 },
];

const getInitials = (account) => {
  if (!account?.firstName || !account?.lastName) {
    return 'ID';
  }

  return `${account?.firstName[0]}${account?.lastName[0]}`;
};

function Navigation() {
  const { authInfo, isAuthenticated, receiveNotifications } = React.useContext(AuthContext);

  const [fetchNotifications, { loading, error, data, refetch }] = useManualQuery(NOTIFICATION_QUERY, {
    variables: {
      id: authInfo?.id,
    },
  });

  React.useEffect(() => {
    if (authInfo?.id) {
      return fetchNotifications();
    }
  }, [authInfo, fetchNotifications]);

  const [updateNotification] = useMutation(UPDATE_MUTATION);

  const _updateNotification = async (options) => {
    const { error } = await updateNotification(options);

    if (!error) {
      refetch();
    }
  };

  const markAsRead = async (notificationId) => {
    await _updateNotification({
      variables: {
        input: {
          id: notificationId,
          read: true,
        },
      },
    });
  };

  const markAsDeleted = async (notificationId) => {
    await _updateNotification({
      variables: {
        input: {
          id: notificationId,
          deleted: true,
        },
      },
    });
  };

  return (
    <div>
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="hidden w-auto h-12 sm:block"
                      src="https://deq.utah.gov/wp-content/themes/deq/assets/images/branding/Logo-Utah-DEQ-Water-Quality-Secondary-White.svg"
                      alt="Workflow"
                    />
                    <img
                      className="w-auto h-12 sm:hidden"
                      src="https://deq.utah.gov/wp-content/themes/deq/assets/images/branding/Logo-Utah-DEQ-Water-Quality.svg"
                      alt="Workflow"
                    />
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-baseline ml-10 space-x-4">
                      <Links links={navigation} isAuthenticated={isAuthenticated} />
                    </div>
                  </div>
                </div>

                {isAuthenticated() ? (
                  <>
                    <div className="hidden md:block">
                      <div className="flex items-center ml-4 md:ml-6">
                        {receiveNotifications() ? (
                          <Popover className="relative ml-3">
                            {({ open }) => (
                              <>
                                <Popover.Button className="flex p-1 text-gray-400 bg-gray-800 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                  <NotificationBell
                                    items={data?.accountById.notifications}
                                    loading={loading}
                                    error={error}
                                  />
                                </Popover.Button>
                                <Transition
                                  show={open}
                                  as={React.Fragment}
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Popover.Panel
                                    static
                                    className="absolute right-0 py-1 mt-2 overflow-scroll origin-top-right bg-white rounded-md shadow-lg w-96 ring-1 ring-black ring-opacity-5 focus:outline-none max-h-64"
                                  >
                                    <Notifications
                                      notifications={data?.accountById.notifications}
                                      loading={loading}
                                      error={error}
                                      read={markAsRead}
                                      remove={markAsDeleted}
                                    />
                                  </Popover.Panel>
                                </Transition>
                              </>
                            )}
                          </Popover>
                        ) : null}
                        {/* Profile dropdown */}
                        <Menu as="div" className="relative ml-3">
                          {({ open }) => (
                            <>
                              <div>
                                <Menu.Button className="flex items-center max-w-xs text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                  <span className="sr-only">Open user menu</span>
                                  <p className="w-8 h-8 text-2xl font-black tracking-tighter text-gray-400 uppercase rounded-full">
                                    {getInitials(data?.accountById)}
                                  </p>
                                </Menu.Button>
                              </div>
                              <Transition
                                show={open}
                                as={React.Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items
                                  static
                                  className="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                >
                                  {profile.map((item) => (
                                    <Menu.Item key={item.key}>
                                      {({ active }) =>
                                        item.clientSide ? (
                                          <Link
                                            key={item.key}
                                            to={item.to}
                                            className={clsx(
                                              active ? 'bg-gray-100' : '',
                                              'block px-4 py-2 text-sm text-gray-700'
                                            )}
                                          >
                                            {item.text}
                                          </Link>
                                        ) : (
                                          <a
                                            href={item.to}
                                            key={item.key}
                                            className={clsx(
                                              active ? 'bg-gray-100' : '',
                                              'block px-4 py-2 text-sm text-gray-700'
                                            )}
                                          >
                                            {item.text}
                                          </a>
                                        )
                                      }
                                    </Menu.Item>
                                  ))}
                                </Menu.Items>
                              </Transition>
                            </>
                          )}
                        </Menu>
                      </div>
                    </div>
                    <div className="flex -mr-2 md:hidden">
                      {/* Mobile menu button */}
                      <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 bg-gray-800 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XIcon className="block w-6 h-6" aria-hidden="true" />
                        ) : (
                          <MenuIcon className="block w-6 h-6" aria-hidden="true" />
                        )}
                      </Disclosure.Button>
                    </div>
                  </>
                ) : (
                  <div className="flex -mr-2 md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 bg-gray-800 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block w-6 h-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon className="block w-6 h-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                )}
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Links links={navigation} isAuthenticated={isAuthenticated} />
              </div>
              {isAuthenticated() ? (
                <div className="pt-4 pb-3 border-t border-gray-700">
                  <Popover>
                    <div className="flex items-center px-5">
                      <div className="flex-shrink-0">
                        <p className="w-10 h-10 text-3xl font-black tracking-tighter text-gray-300 uppercase rounded-full">
                          {`${data?.accountById.firstName[0]}${data?.accountById.lastName[0]}`}
                        </p>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium leading-none text-white">
                          {`${data?.accountById.firstName} ${data?.accountById.lastName}`}
                        </div>
                        <div className="text-sm font-medium leading-none text-gray-400">{data?.accountById.email}</div>
                      </div>
                      <div className="flex-shrink-0 p-1 ml-auto text-gray-400 bg-gray-800 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                        {receiveNotifications() ? (
                          <Popover.Button>
                            <NotificationBell items={data?.accountById.notifications} loading={loading} error={error} />
                          </Popover.Button>
                        ) : null}
                      </div>
                    </div>
                    <div className="px-2 mt-3 space-y-1">
                      <Popover.Panel className="overflow-scroll bg-white rounded-sm max-h-36">
                        <Notifications
                          notifications={data?.accountById.notifications}
                          loading={loading}
                          error={error}
                          read={markAsRead}
                          remove={markAsDeleted}
                        />
                      </Popover.Panel>
                    </div>
                    <div className="px-2 mt-3 space-y-1">
                      {profile.map((item) => (
                        <Link
                          key={item.key}
                          to={item.to}
                          className="block px-3 py-2 text-base font-medium text-gray-400 rounded-md hover:text-white hover:bg-gray-700"
                        >
                          {item.text}
                        </Link>
                      ))}
                    </div>
                  </Popover>
                </div>
              ) : null}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}

function NotificationBell({ loading, error, items }) {
  return (
    <>
      <span className="sr-only">View notifications</span>
      <BellIcon
        className={clsx('w-6 h-6', {
          'text-yellow-400': !loading && !error && items?.filter((x) => !x.read).length > 0,
          'text-gray-300': loading,
          'text-red-400': error,
        })}
        aria-hidden="true"
      />
    </>
  );
}

function Links({ links, isAuthenticated }) {
  if (!isAuthenticated()) {
    return (
      <a
        href="/api/login"
        className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
      >
        Login
      </a>
    );
  }

  return links.map((item, itemIdx) =>
    itemIdx === 0 ? (
      <Link key={item.key} className="px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md" to={item.to}>
        {item.text}
      </Link>
    ) : (
      <Link
        key={item.key}
        to={item.to}
        className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
      >
        {item.text}
      </Link>
    )
  );
}

function Notifications({ loading, error, notifications, read, remove }) {
  if (loading) {
    return <Facebook />;
  }

  if (error) {
    // todo: log this
    return <NotificationMessage title="Uh oh!" message="We're having trouble finding your notifications." />;
  }

  if (notifications === undefined || notifications === null) {
    return null;
  }

  const availableNotifications = notifications.filter((notification) => !notification.deleted);

  if (availableNotifications.length === 0) {
    return <NotificationMessage title="All caught up!" message="Take a break, go for a walk, be your best you." />;
  }

  return availableNotifications.map((notification) => (
    <div
      key={notification.id}
      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      <span className="self-center text-xs text-gray-400">
        {dateFormatter.format(Date.parse(notification.createdAt))}
      </span>{' '}
      <span>
        {notification.event === 'NEW_USER_ACCOUNT_REGISTRATION'
          ? `${notification.additionalData.name} signed up`
          : 'Other'}
      </span>
      <span>
        <Link to={notification.url}>
          <LinkIcon className="inline-block w-5 h-5 ml-1 text-blue-400" />
        </Link>
        {notification.read ? (
          <span
            alt={'Read at: ' + dateFormatter.format(Date.parse(notification.readAt))}
            title={'Read at: ' + dateFormatter.format(Date.parse(notification.readAt))}
          >
            <MailOpenIcon className="inline-block w-5 h-5 ml-1 text-gray-400" />
          </span>
        ) : (
          <span>
            <MailIcon className="inline-block w-5 h-5 ml-1 text-blue-400" onClick={() => read(notification.id)} />
          </span>
        )}
        <TrashIcon className="inline-block w-5 h-5 ml-1 text-red-300" onClick={() => remove(notification.id)} />
      </span>
    </div>
  ));
}

function NotificationMessage({ title, text }) {
  return (
    <div className="flex flex-col items-center justify-center h-16 text-gray-500">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default Navigation;
