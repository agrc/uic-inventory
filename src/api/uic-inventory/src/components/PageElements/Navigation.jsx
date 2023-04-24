import { Fragment, useContext } from 'react';
import clsx from 'clsx';
import {
  BellIcon,
  LinkIcon,
  EnvelopeOpenIcon,
  EnvelopeIcon,
  Bars3Icon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Disclosure, Menu, Popover, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { Facebook } from 'react-content-loader';
import { AuthContext } from '../../AuthProvider';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ky from 'ky';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
  hour12: true,
  hour: 'numeric',
  minute: 'numeric',
});

const navigation = [
  {
    text: 'Sites',
    to: '/',
    level: 0,
    key: 1,
  },
  {
    text: 'Contact us',
    to: '/contact',
    level: 0,
    key: 2,
  },
  {
    text: 'Accounts',
    to: '/admin/accounts',
    level: 1,
    key: 3,
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
  const { authInfo, isAuthenticated, receiveNotifications, isElevated } = useContext(AuthContext);
  const { status, data, error, refetch } = useQuery('notifications', () => ky.get(`/api/notifications/mine`).json(), {
    enabled: authInfo?.id ? true : false,
    refetchInterval: 1000 * 60 * 10,
  });

  return (
    <div className="print:hidden">
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <img className="hidden h-12 w-auto sm:block" src="/logo-alternate.svg" alt="Workflow" />
                    <img className="h-12 w-auto sm:hidden" src="/logo.svg" alt="Workflow" />
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      <Links links={navigation} isAuthenticated={isAuthenticated} isElevated={isElevated} />
                    </div>
                  </div>
                </div>

                {isAuthenticated() ? (
                  <>
                    <div className="hidden md:block">
                      <div className="ml-4 flex items-center md:ml-6">
                        {receiveNotifications() ? (
                          <Popover className="relative ml-3">
                            {({ open }) => (
                              <>
                                <Popover.Button className="flex rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                  <NotificationBell items={data?.notifications} status={status} error={error} />
                                </Popover.Button>
                                <Transition
                                  show={open}
                                  as={Fragment}
                                  enter="transition ease-out duration-100"
                                  enterFrom="opacity-0 scale-95"
                                  enterTo="opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="opacity-100 scale-100"
                                  leaveTo="opacity-0 scale-95"
                                >
                                  <Popover.Panel
                                    static
                                    className="absolute right-0 z-20 mt-2 max-h-64 w-96 origin-top-right overflow-scroll rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                  >
                                    <Notifications
                                      notifications={data?.notifications}
                                      status={status}
                                      error={error}
                                      refetch={refetch}
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
                                <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                  <span className="sr-only">Open user menu</span>
                                  <p className="h-8 w-8 rounded-full text-2xl font-black uppercase tracking-tighter text-gray-400">
                                    {getInitials(data)}
                                  </p>
                                </Menu.Button>
                              </div>
                              <Transition
                                show={open}
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                              >
                                <Menu.Items
                                  static
                                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                >
                                  {profile.map((item) => (
                                    <Menu.Item key={item.key}>
                                      {() =>
                                        item.clientSide ? (
                                          <Link
                                            key={item.key}
                                            to={item.to}
                                            className="block px-4 py-2 text-sm text-gray-700"
                                          >
                                            {item.text}
                                          </Link>
                                        ) : (
                                          <a
                                            href={item.to}
                                            key={item.key}
                                            className="block px-4 py-2 text-sm text-gray-700"
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
                    <div className="-mr-2 flex md:hidden">
                      {/* Mobile menu button */}
                      <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                        )}
                      </Disclosure.Button>
                    </div>
                  </>
                ) : (
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                )}
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                <Links links={navigation} isAuthenticated={isAuthenticated} isElevated={isElevated} />
              </div>
              {isAuthenticated() ? (
                <div className="border-t border-gray-700 pb-3 pt-4">
                  <Popover>
                    <div className="flex items-center px-5">
                      <div className="shrink-0">
                        <p className="h-10 w-10 rounded-full text-3xl font-black uppercase tracking-tighter text-gray-300">
                          {`${data?.firstName[0]}${data?.lastName[0]}`}
                        </p>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium leading-none text-white">
                          {`${data?.firstName} ${data?.lastName}`}
                        </div>
                        <div className="text-sm font-medium leading-none text-gray-400">{data?.email}</div>
                      </div>
                      <div className="ml-auto shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        {receiveNotifications() ? (
                          <Popover.Button>
                            <NotificationBell items={data?.notifications} status={status} error={error} />
                          </Popover.Button>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                      <Popover.Panel className="max-h-36 overflow-scroll rounded-sm bg-white">
                        <Notifications
                          notifications={data?.notifications}
                          status={status}
                          error={error}
                          refetch={refetch}
                        />
                      </Popover.Panel>
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                      {profile.map((item) => (
                        <Link
                          key={item.key}
                          to={item.to}
                          className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
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

function NotificationBell({ status, error, items }) {
  return (
    <>
      <span className="sr-only">View notifications</span>
      <BellIcon
        className={clsx('h-6 w-6', {
          'text-amber-400': status !== 'loading' && !error && items?.filter((x) => !x.read).length > 0,
          'text-gray-300': status === 'loading',
          'text-red-400': error,
        })}
        aria-hidden="true"
      />
    </>
  );
}

function Links({ links, isAuthenticated, isElevated }) {
  if (!isAuthenticated()) {
    return (
      <a
        href="/api/login"
        className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        Login
      </a>
    );
  }

  let level = 0;
  if (isElevated()) {
    level = 1;
  }

  return links
    .filter((x) => level >= x.level)
    .map((item) => (
      <Link
        key={item.key}
        to={item.to}
        className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        {item.text}
      </Link>
    ));
}

function Notifications({ status, error, notifications }) {
  const queryClient = useQueryClient();
  const { mutate, status: mutateStatus } = useMutation(
    ({ id, key }) =>
      ky
        .put('/api/notification', {
          json: {
            id: id,
            [key]: true,
          },
        })
        .json(),
    {
      onMutate: async ({ id, key }) => {
        await queryClient.cancelQueries('notifications');
        const previousValue = queryClient.getQueryData('notifications');

        queryClient.setQueryData('notifications', (old) => {
          return {
            ...old,
            notifications: old.notifications.map((item) => {
              if (item.id === id) {
                return {
                  ...item,
                  [key]: true,
                  [`${key}At`]: new Date().toISOString(),
                };
              }

              return item;
            }),
          };
        });

        return previousValue;
      },
      onError: (err, variables, previousValue) => {
        queryClient.setQueryData('notifications', previousValue);
        //! TODO: toast error
      },
      onSettled: () => {
        queryClient.invalidateQueries('notifications');
      },
    }
  );

  if (['idle', 'loading'].includes(status)) {
    return <Facebook />;
  }

  if (error) {
    // TODO: log this
    return <NotificationMessage title="Uh oh!" message="We're having trouble finding your notifications." />;
  }

  if (notifications === undefined || notifications === null) {
    return null;
  }

  const availableNotifications = notifications.filter((notification) => !notification.deleted);

  if (availableNotifications.length === 0) {
    return <NotificationMessage title="All caught up!" message="Take a break, go for a walk, be your best you." />;
  }

  const formatNotification = (notification) => {
    switch (notification.event) {
      case 'new_user_account_registration':
        return `${notification.additionalData.name} signed up`;
      case 'admin_promotion':
        return `${notification.additionalData.name} is now an administrator`;
      case 'inventory_submission':
        return `${notification.additionalData.name} submitted inventory ${notification.additionalData.inventoryId}`;
      default:
        return `Other notification: ${notification.event}`;
    }
  };

  return availableNotifications.map((notification) => (
    <div
      key={notification.id}
      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      <span className="self-center text-xs text-gray-400">
        {dateFormatter.format(Date.parse(notification.createdAt))}
      </span>{' '}
      <span>{formatNotification(notification)}</span>
      <span>
        <Link to={notification.url}>
          <LinkIcon className="ml-1 inline-block h-5 w-5 text-blue-400" />
        </Link>
        {notification.read ? (
          <span
            alt={'Read at: ' + dateFormatter.format(Date.parse(notification.readAt))}
            title={'Read at: ' + dateFormatter.format(Date.parse(notification.readAt))}
          >
            <EnvelopeOpenIcon className="ml-1 inline-block h-5 w-5 text-gray-400" />
          </span>
        ) : (
          <span>
            <EnvelopeIcon
              className="ml-1 inline-block h-5 w-5 cursor-pointer text-blue-400"
              onClick={() => mutateStatus !== 'loading' && mutate({ id: notification.id, key: 'read' })}
            />
          </span>
        )}
        <TrashIcon
          className="ml-1 inline-block h-5 w-5 cursor-pointer text-red-300"
          onClick={() => mutateStatus !== 'loading' && mutate({ id: notification.id, key: 'deleted' })}
        />
      </span>
    </div>
  ));
}

function NotificationMessage({ title, text }) {
  return (
    <div className="flex h-16 flex-col items-center justify-center text-gray-500">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default Navigation;
