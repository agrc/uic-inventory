import { Disclosure, Menu, Popover, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  LinkIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import ky from 'ky';
import { Fragment, useContext } from 'react';
import { Facebook } from 'react-content-loader';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';
import onRequestError from './ToastErrors';
import { UtahHeader } from './UtahHeader';

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

function Navigation({ authenticationStatus }) {
  const { authInfo, isAuthenticated, receiveNotifications, isElevated } = useContext(AuthContext);
  const { status, data, error, refetch } = useQuery({
    queryKey: ['notifications', authInfo.id],
    queryFn: () => ky.get(`/api/notifications/mine`).json(),
    enabled: authInfo?.id ? true : false,
    refetchInterval: 1000 * 60 * 10,
  });

  if (authenticationStatus === 'pending') {
    return (
      <>
        <UtahHeader>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 150">
            <defs>
              <style>{'.cls-3{fill:#0c87a4}.cls-4{fill:#034a64}'}</style>
            </defs>
            <g
              style={{
                isolation: 'isolate',
              }}
            >
              <g>
                <path
                  fill="#00a1c6"
                  d="M14 150h27.92l-14.77-25.59-14 24.2A.93.93 0 0 0 14 150Z"
                  style={{
                    mixBlendMode: 'multiply',
                  }}
                />
                <path d="M30.65 118.35 48.92 150h28.64L44.97 93.54l-14.32 24.81z" className="cls-3" />
                <path
                  d="M125.44 62.66a62.66 62.66 0 1 0-99.2 50.9l12.61-21.85a37.64 37.64 0 1 1 42.79 3.51l-17.9-31a1.07 1.07 0 0 0-1.85 0L48.47 87.48 84.56 150h27.08a.94.94 0 0 0 .81-1.41l-18.3-31.69a62.62 62.62 0 0 0 31.29-54.24Z"
                  className="cls-4"
                />
                <path
                  d="M149.87 35.24v-6.6a1.17 1.17 0 0 1 2.34 0v6.5c0 2.47 1.27 3.78 3.36 3.78s3.35-1.24 3.35-3.69v-6.6a1.17 1.17 0 0 1 2.34 0v6.48c0 4-2.24 6-5.72 6s-5.67-2.02-5.67-5.87Zm18.61-5.5h-3.23a1.08 1.08 0 1 1 0-2.17h8.84a1.08 1.08 0 0 1 0 2.17h-3.25v10.08a1.18 1.18 0 0 1-2.36 0Zm7.17 9.62 4.94-11a1.48 1.48 0 0 1 1.41-1h.11a1.46 1.46 0 0 1 1.39 1l4.94 11a1 1 0 0 1 .13.49 1.1 1.1 0 0 1-1.1 1.12 1.2 1.2 0 0 1-1.14-.82l-1.08-2.49h-6.46l-1.12 2.57a1.12 1.12 0 0 1-1.08.74 1.07 1.07 0 0 1-1.08-1.08 1.19 1.19 0 0 1 .14-.53Zm8.71-3.76L182 30.22l-2.34 5.38Zm7.31-6.96a1.17 1.17 0 0 1 2.34 0v4.47h6.35v-4.47a1.17 1.17 0 0 1 2.34 0v11.18a1.17 1.17 0 0 1-2.34 0v-4.55H194v4.54a1.17 1.17 0 0 1-2.34 0Zm21.67.11a1.16 1.16 0 0 1 1.18-1.18h3.78c4.18 0 7.07 2.87 7.07 6.62 0 3.74-2.89 6.65-7.07 6.65h-3.78a1.16 1.16 0 0 1-1.18-1.18Zm5 10a4.34 4.34 0 0 0 4.62-4.49 4.37 4.37 0 0 0-4.62-4.52h-2.62v9Zm10.66.95V28.75a1.16 1.16 0 0 1 1.18-1.18h7.74a1.06 1.06 0 0 1 1 1 1 1 0 0 1-1 1h-6.62v3.46h5.7a1.06 1.06 0 0 1 1 1.06 1 1 0 0 1-1 1h-5.7v3.57h6.7a1.05 1.05 0 0 1 1 1 1 1 0 0 1-1 1h-7.83a1.16 1.16 0 0 1-1.17-.96Zm13.43-10.95a1.16 1.16 0 0 1 1.18-1.18h4.07c3.12 0 5.06 1.77 5.06 4.45 0 3-2.4 4.54-5.32 4.54h-2.64v3.21a1.17 1.17 0 0 1-2.34 0Zm5.06 5.74c1.77 0 2.87-1 2.87-2.38 0-1.56-1.12-2.38-2.87-2.38h-2.72v4.79Zm6.64 4.87 4.94-11a1.48 1.48 0 0 1 1.41-1h.11a1.46 1.46 0 0 1 1.39 1l4.94 11a1 1 0 0 1 .13.49A1.1 1.1 0 0 1 266 41a1.2 1.2 0 0 1-1.14-.82l-1.08-2.49h-6.46l-1.12 2.57a1.12 1.12 0 0 1-1.08.74 1.07 1.07 0 0 1-1.12-1.11 1.2 1.2 0 0 1 .13-.53Zm8.71-3.76-2.34-5.38-2.34 5.38Zm7.31-6.85a1.16 1.16 0 0 1 1.18-1.18h4.75a5.36 5.36 0 0 1 3.84 1.33 4 4 0 0 1 1.1 2.87 3.94 3.94 0 0 1-3 4l2.53 3.23a1.36 1.36 0 0 1 .38.89 1.1 1.1 0 0 1-1.12 1.11 1.34 1.34 0 0 1-1.14-.61l-3.23-4.12h-2.95v3.57a1.17 1.17 0 0 1-2.34 0Zm5.76 5.42c1.67 0 2.74-.87 2.74-2.22 0-1.43-1-2.21-2.76-2.21h-3.4v4.47Zm11.8-4.43h-3.23a1.08 1.08 0 1 1 0-2.17h8.84a1.08 1.08 0 0 1 0 2.17h-3.25v10.08a1.18 1.18 0 0 1-2.36 0Zm9.68-1.06a1.17 1.17 0 0 1 1.18-1.18h.25a1.23 1.23 0 0 1 1.08.63l4 6.31 4-6.33a1.18 1.18 0 0 1 1.1-.61h.25a1.17 1.17 0 0 1 1.18 1.18v11.14a1.16 1.16 0 0 1-1.14 1.18 1.18 1.18 0 0 1-1.16-1.16v-8l-3.25 4.89a1.09 1.09 0 0 1-2 0l-3.23-4.85v8a1.14 1.14 0 0 1-1.12 1.12 1.12 1.12 0 0 1-1.14-1.14ZM314.8 39.7V28.75a1.16 1.16 0 0 1 1.2-1.18h7.74a1.06 1.06 0 0 1 1 1 1 1 0 0 1-1 1h-6.58v3.46h5.72a1.06 1.06 0 0 1 1 1.06 1 1 0 0 1-1 1h-5.72v3.57h6.67a1.05 1.05 0 0 1 1 1 1 1 0 0 1-1 1H316a1.16 1.16 0 0 1-1.2-.96Zm13.47-11.02a1.17 1.17 0 0 1 1.18-1.18h.25a1.47 1.47 0 0 1 1.22.68l6.65 8.61v-8.17a1.15 1.15 0 0 1 2.3 0V39.8a1.14 1.14 0 0 1-1.14 1.2h-.09a1.47 1.47 0 0 1-1.22-.7l-6.84-8.86v8.44a1.15 1.15 0 0 1-2.3 0Zm18.92 1.06H344a1.08 1.08 0 0 1 0-2.17h8.84a1.08 1.08 0 0 1 0 2.17h-3.25v10.08a1.18 1.18 0 0 1-2.36 0Zm15.42 6.79a6 6 0 0 1 5.85-5.89 4.43 4.43 0 0 1 4.71 4.6 6 6 0 0 1-5.85 5.87 4.43 4.43 0 0 1-4.71-4.58Zm8.29-1.24a2.43 2.43 0 0 0-2.57-2.66c-2 0-3.44 2-3.44 3.82a2.43 2.43 0 0 0 2.57 2.66c1.94 0 3.44-2.01 3.44-3.82Zm6.95 4.55a1.38 1.38 0 0 1-1.29 1.16c-.76 0-1.18-.55-.93-1.48l1.81-6.67h-.27a1 1 0 0 1-.87-1 1 1 0 0 1 1-1h.7l.19-.82a3.69 3.69 0 0 1 3.81-3.12 4.56 4.56 0 0 1 1.08.13.89.89 0 0 1 .78.91.93.93 0 0 1-1.06 1 2.42 2.42 0 0 0-.74-.11 1.62 1.62 0 0 0-1.65 1.41l-.15.57h1.62a1 1 0 0 1 0 2h-2.11ZM150.08 62.52V51.57a1.16 1.16 0 0 1 1.18-1.18H159a1.06 1.06 0 0 1 1 1 1 1 0 0 1-1 1h-6.58v3.46h5.72a1.06 1.06 0 0 1 1 1.06 1 1 0 0 1-1 1h-5.72v3.57h6.67a1.05 1.05 0 0 1 1 1 1 1 0 0 1-1 1h-7.83a1.16 1.16 0 0 1-1.18-.96Zm13.47-11.03a1.17 1.17 0 0 1 1.18-1.18h.27a1.47 1.47 0 0 1 1.22.68l6.65 8.61v-8.16a1.15 1.15 0 0 1 2.3 0v11.17a1.14 1.14 0 0 1-1.17 1.16h-.1a1.47 1.47 0 0 1-1.22-.7l-6.84-8.86v8.44a1.15 1.15 0 0 1-2.3 0ZM183 62.94 178.34 52a1.31 1.31 0 0 1-.13-.55 1.15 1.15 0 0 1 1.18-1.14 1.22 1.22 0 0 1 1.2.84l3.84 9.6 3.9-9.68a1.2 1.2 0 0 1 1.12-.76 1.13 1.13 0 0 1 1.16 1.12 1.35 1.35 0 0 1-.11.49l-4.68 11a1.39 1.39 0 0 1-1.35 1h-.13a1.39 1.39 0 0 1-1.34-.98Zm10.72-11.48a1.17 1.17 0 0 1 2.34 0v11.17a1.17 1.17 0 0 1-2.34 0Zm6.7.11a1.16 1.16 0 0 1 1.18-1.18h4.75a5.36 5.36 0 0 1 3.84 1.33 4 4 0 0 1 1.1 2.87 3.94 3.94 0 0 1-3 4l2.55 3.21a1.36 1.36 0 0 1 .38.89 1.1 1.1 0 0 1-1.12 1.08 1.34 1.34 0 0 1-1.14-.61l-3.23-4.12h-2.95v3.57a1.17 1.17 0 0 1-2.34 0Zm5.76 5.43c1.67 0 2.74-.87 2.74-2.22 0-1.43-1-2.21-2.76-2.21h-3.4V57Zm8.01.08a7 7 0 0 1 13.92 0 7 7 0 0 1-13.92 0Zm11.46 0a4.56 4.56 0 0 0-4.52-4.73 4.5 4.5 0 0 0-4.49 4.7 4.54 4.54 0 0 0 4.52 4.71 4.48 4.48 0 0 0 4.5-4.68Zm6.09-5.59a1.17 1.17 0 0 1 1.18-1.18h.25a1.47 1.47 0 0 1 1.22.68l6.61 8.62v-8.17a1.15 1.15 0 0 1 2.3 0v11.17a1.14 1.14 0 0 1-1.14 1.16h-.09a1.47 1.47 0 0 1-1.22-.7L234 54.21v8.44a1.15 1.15 0 0 1-2.3 0Zm15.92 0a1.17 1.17 0 0 1 1.18-1.18h.25a1.23 1.23 0 0 1 1.08.63l4 6.31 4-6.33a1.18 1.18 0 0 1 1.06-.61h.25a1.17 1.17 0 0 1 1.18 1.18v11.14a1.16 1.16 0 0 1-1.18 1.16 1.18 1.18 0 0 1-1.16-1.16v-8l-3.25 4.89a1.09 1.09 0 0 1-2 0L250 54.69v8a1.14 1.14 0 0 1-1.16 1.14 1.12 1.12 0 0 1-1.14-1.14Zm17.42 11.03V51.57a1.16 1.16 0 0 1 1.18-1.18H274a1.06 1.06 0 0 1 1 1 1 1 0 0 1-1 1h-6.58v3.46h5.72a1.06 1.06 0 0 1 1 1.06 1 1 0 0 1-1 1h-5.72v3.57h6.67a1.05 1.05 0 0 1 1 1 1 1 0 0 1-1 1h-7.83a1.16 1.16 0 0 1-1.18-.96Zm13.47-11.03a1.17 1.17 0 0 1 1.18-1.18h.27a1.47 1.47 0 0 1 1.22.68l6.65 8.61v-8.16a1.15 1.15 0 0 1 2.3 0v11.17a1.14 1.14 0 0 1-1.17 1.16h-.1a1.47 1.47 0 0 1-1.22-.7l-6.84-8.86v8.44a1.15 1.15 0 0 1-2.3 0Zm18.91 1.07h-3.23a1.08 1.08 0 1 1 0-2.17h8.84a1.08 1.08 0 0 1 0 2.17h-3.25v10.07a1.18 1.18 0 0 1-2.36 0Zm7.18 9.62 4.94-11a1.48 1.48 0 0 1 1.41-1h.11a1.46 1.46 0 0 1 1.39 1l4.94 11a1 1 0 0 1 .13.49 1.1 1.1 0 0 1-1.1 1.12 1.2 1.2 0 0 1-1.14-.82l-1.08-2.49h-6.46l-1.12 2.57a1.12 1.12 0 0 1-1.08.74 1.07 1.07 0 0 1-1.08-1.08 1.2 1.2 0 0 1 .14-.53Zm8.71-3.76L311 53l-2.34 5.38Zm7.31-6.96a1.17 1.17 0 0 1 2.34 0v10.11h6a1.06 1.06 0 0 1 0 2.13h-7.19a1.16 1.16 0 0 1-1.18-1.18Zm18.4 5.62A7 7 0 0 1 353 57a6.89 6.89 0 0 1-1.35 4.09l.86.7a1.15 1.15 0 0 1 .44.91 1.12 1.12 0 0 1-1.92.78l-1-.86a6.92 6.92 0 0 1-4 1.25 6.75 6.75 0 0 1-6.97-6.79Zm7.19 1.75a1.12 1.12 0 0 1 1.1-1.12 1.13 1.13 0 0 1 .82.34l1.71 1.56a5 5 0 0 0 .65-2.53 4.56 4.56 0 0 0-4.53-4.77 4.5 4.5 0 0 0-4.49 4.7 4.55 4.55 0 0 0 6.82 4.11l-1.65-1.41a1.14 1.14 0 0 1-.43-.88Zm10.25-.78v-6.6a1.17 1.17 0 0 1 2.34 0V58c0 2.47 1.27 3.78 3.37 3.78s3.35-1.24 3.35-3.69v-6.6a1.17 1.17 0 0 1 2.34 0v6.48c0 4-2.24 6-5.72 6s-5.68-2.06-5.68-5.92Zm14 4.13 4.94-11a1.48 1.48 0 0 1 1.41-1h.15a1.46 1.46 0 0 1 1.39 1l4.94 11a1 1 0 0 1 .13.49 1.1 1.1 0 0 1-1.1 1.12 1.2 1.2 0 0 1-1.14-.82l-1.08-2.49h-6.46l-1.12 2.57a1.12 1.12 0 0 1-1.08.74 1.07 1.07 0 0 1-1.08-1.08 1.2 1.2 0 0 1 .1-.53Zm8.71-3.76L376.87 53l-2.34 5.38Zm7.3-6.96a1.17 1.17 0 0 1 2.34 0v10.11h6a1.06 1.06 0 1 1 0 2.13h-7.19a1.16 1.16 0 0 1-1.18-1.18Zm12.49 0a1.17 1.17 0 0 1 2.34 0v11.17a1.17 1.17 0 0 1-2.34 0Zm9.69 1.1h-3.23a1.08 1.08 0 1 1 0-2.17h8.84a1.08 1.08 0 0 1 0 2.17H411v10.07a1.18 1.18 0 0 1-2.36 0Zm13.98 5.97-4.58-6.29a1.44 1.44 0 0 1-.27-.82A1.14 1.14 0 0 1 419 50.3a1.35 1.35 0 0 1 1.14.7l3.71 5.34 3.76-5.34a1.34 1.34 0 0 1 1.12-.7 1.11 1.11 0 0 1 1.14 1.14 1.42 1.42 0 0 1-.32.84L425 58.47v4.16a1.17 1.17 0 0 1-2.34 0Z"
                  className="cls-3"
                />
                <path
                  d="M149.44 83.65a2.7 2.7 0 0 1-.16-.78 2.06 2.06 0 0 1 2.13-2 2.09 2.09 0 0 1 2 1.48l3.74 11.56 3.77-11.45A2.18 2.18 0 0 1 163 80.8h.32a2.15 2.15 0 0 1 2.1 1.64l3.77 11.45L173 82.33a2.08 2.08 0 0 1 2-1.48 2 2 0 0 1 2 2 2.87 2.87 0 0 1-.16.81l-5.28 14.81a2.3 2.3 0 0 1-2.15 1.7H169a2.24 2.24 0 0 1-2.13-1.7l-3.72-10.8-3.72 10.8a2.24 2.24 0 0 1-2.13 1.7h-.43a2.3 2.3 0 0 1-2.15-1.7Zm31.1 13.55 6.57-14.84a2.56 2.56 0 0 1 2.42-1.64h.24a2.53 2.53 0 0 1 2.4 1.64l6.57 14.84a2 2 0 0 1 .26.8 2 2 0 0 1-2 2 2.11 2.11 0 0 1-2-1.43l-1.27-3h-8.3l-1.32 3.1a2 2 0 0 1-1.91 1.29 1.91 1.91 0 0 1-1.91-1.94 2.19 2.19 0 0 1 .25-.82ZM192.2 92l-2.61-6.22L187 92Zm14.74-7.16h-4A1.91 1.91 0 1 1 203 81h12.12a1.91 1.91 0 1 1 0 3.83h-4V98a2.07 2.07 0 0 1-4.15 0Zm15.51 12.96V83.09a2.06 2.06 0 0 1 2.07-2.09H235a1.86 1.86 0 0 1 1.86 1.86A1.84 1.84 0 0 1 235 84.7h-8.4v3.83h7.19a1.86 1.86 0 0 1 1.86 1.86 1.84 1.84 0 0 1-1.86 1.83h-7.19v4h8.54A1.86 1.86 0 0 1 237 98a1.84 1.84 0 0 1-1.86 1.83h-10.62a2.06 2.06 0 0 1-2.07-2.03Zm20.86-14.71a2.06 2.06 0 0 1 2.08-2.09h6.55a7.51 7.51 0 0 1 5.49 1.91 5.92 5.92 0 0 1 1.57 4.33v.05a5.76 5.76 0 0 1-3.73 5.71l2.88 3.5a2.42 2.42 0 0 1 .67 1.59 1.93 1.93 0 0 1-2 1.91 2.48 2.48 0 0 1-2-1.08l-4-5.12h-3.31V98a2.07 2.07 0 0 1-4.15 0Zm8.35 7.08c2 0 3.18-1.08 3.18-2.67v-.05c0-1.78-1.24-2.69-3.26-2.69h-4.12v5.41Zm-101.87 31.11v-.05a10 10 0 0 1 20-.05v.05a9.68 9.68 0 0 1-1.67 5.41l.81.67a2 2 0 0 1 .75 1.56 1.94 1.94 0 0 1-3.31 1.4l-1-.92a10.27 10.27 0 0 1-5.6 1.62 9.66 9.66 0 0 1-9.98-9.69Zm9.8 2.13a2 2 0 0 1 1.94-2 1.91 1.91 0 0 1 1.37.57l2.07 1.86a6.61 6.61 0 0 0 .51-2.59v-.05a5.73 5.73 0 0 0-5.71-5.93 5.64 5.64 0 0 0-5.66 5.87v.05a5.73 5.73 0 0 0 5.71 5.93 5.67 5.67 0 0 0 2.48-.51l-2-1.67a2 2 0 0 1-.7-1.53Zm16.6-.84v-8.86a2.07 2.07 0 0 1 4.15 0v8.75c0 3.07 1.54 4.66 4.07 4.66s4.07-1.54 4.07-4.53v-8.89a2.07 2.07 0 1 1 4.15 0v8.73c0 5.71-3.21 8.51-8.27 8.51s-8.17-2.82-8.17-8.37Zm21.55 5.43 6.57-14.84a2.56 2.56 0 0 1 2.42-1.64h.27a2.53 2.53 0 0 1 2.4 1.64l6.55 14.84a2 2 0 0 1 .22.84 2 2 0 0 1-2 2 2.11 2.11 0 0 1-2-1.43l-1.27-3h-8.3l-1.32 3.1a2 2 0 0 1-1.91 1.29 1.91 1.91 0 0 1-1.91-1.94 2.19 2.19 0 0 1 .28-.86Zm11.66-5.23-2.61-6.22-2.61 6.22Zm12.36-9.06a2.07 2.07 0 1 1 4.15 0v13.17h7.68a1.89 1.89 0 1 1 0 3.77h-9.75a2.06 2.06 0 0 1-2.07-2.07Zm19.24 0a2.07 2.07 0 1 1 4.15 0v15a2.07 2.07 0 0 1-4.15 0Zm15.56 1.91h-4a1.91 1.91 0 1 1 0-3.83h12.12a1.91 1.91 0 1 1 0 3.83h-4v13.12a2.07 2.07 0 0 1-4.15 0Zm21.3 7.76-6.09-8.27a2.46 2.46 0 0 1-.51-1.48 2 2 0 0 1 2.07-2 2.39 2.39 0 0 1 2 1.27l4.58 6.6 4.66-6.65a2.38 2.38 0 0 1 2-1.24 1.92 1.92 0 0 1 2 2 2.57 2.57 0 0 1-.54 1.45L282 123.3v5.44a2.07 2.07 0 1 1-4.15 0Z"
                  className="cls-4"
                />
              </g>
            </g>
          </svg>
        </UtahHeader>
        <Disclosure as="nav" className="bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div>
                  <div className="flex items-baseline space-x-4">
                    <div className="animate-text cursor-default select-none bg-gradient-to-r from-white via-blue-500 to-white bg-clip-text text-sm text-transparent">
                      Checking login status...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Disclosure>
      </>
    );
  }

  return (
    <>
      <UtahHeader>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 150">
          <defs>
            <style>{'.cls-3{fill:#0c87a4}.cls-4{fill:#034a64}'}</style>
          </defs>
          <g
            style={{
              isolation: 'isolate',
            }}
          >
            <g>
              <path
                fill="#00a1c6"
                d="M14 150h27.92l-14.77-25.59-14 24.2A.93.93 0 0 0 14 150Z"
                style={{
                  mixBlendMode: 'multiply',
                }}
              />
              <path d="M30.65 118.35 48.92 150h28.64L44.97 93.54l-14.32 24.81z" className="cls-3" />
              <path
                d="M125.44 62.66a62.66 62.66 0 1 0-99.2 50.9l12.61-21.85a37.64 37.64 0 1 1 42.79 3.51l-17.9-31a1.07 1.07 0 0 0-1.85 0L48.47 87.48 84.56 150h27.08a.94.94 0 0 0 .81-1.41l-18.3-31.69a62.62 62.62 0 0 0 31.29-54.24Z"
                className="cls-4"
              />
              <path
                d="M149.87 35.24v-6.6a1.17 1.17 0 0 1 2.34 0v6.5c0 2.47 1.27 3.78 3.36 3.78s3.35-1.24 3.35-3.69v-6.6a1.17 1.17 0 0 1 2.34 0v6.48c0 4-2.24 6-5.72 6s-5.67-2.02-5.67-5.87Zm18.61-5.5h-3.23a1.08 1.08 0 1 1 0-2.17h8.84a1.08 1.08 0 0 1 0 2.17h-3.25v10.08a1.18 1.18 0 0 1-2.36 0Zm7.17 9.62 4.94-11a1.48 1.48 0 0 1 1.41-1h.11a1.46 1.46 0 0 1 1.39 1l4.94 11a1 1 0 0 1 .13.49 1.1 1.1 0 0 1-1.1 1.12 1.2 1.2 0 0 1-1.14-.82l-1.08-2.49h-6.46l-1.12 2.57a1.12 1.12 0 0 1-1.08.74 1.07 1.07 0 0 1-1.08-1.08 1.19 1.19 0 0 1 .14-.53Zm8.71-3.76L182 30.22l-2.34 5.38Zm7.31-6.96a1.17 1.17 0 0 1 2.34 0v4.47h6.35v-4.47a1.17 1.17 0 0 1 2.34 0v11.18a1.17 1.17 0 0 1-2.34 0v-4.55H194v4.54a1.17 1.17 0 0 1-2.34 0Zm21.67.11a1.16 1.16 0 0 1 1.18-1.18h3.78c4.18 0 7.07 2.87 7.07 6.62 0 3.74-2.89 6.65-7.07 6.65h-3.78a1.16 1.16 0 0 1-1.18-1.18Zm5 10a4.34 4.34 0 0 0 4.62-4.49 4.37 4.37 0 0 0-4.62-4.52h-2.62v9Zm10.66.95V28.75a1.16 1.16 0 0 1 1.18-1.18h7.74a1.06 1.06 0 0 1 1 1 1 1 0 0 1-1 1h-6.62v3.46h5.7a1.06 1.06 0 0 1 1 1.06 1 1 0 0 1-1 1h-5.7v3.57h6.7a1.05 1.05 0 0 1 1 1 1 1 0 0 1-1 1h-7.83a1.16 1.16 0 0 1-1.17-.96Zm13.43-10.95a1.16 1.16 0 0 1 1.18-1.18h4.07c3.12 0 5.06 1.77 5.06 4.45 0 3-2.4 4.54-5.32 4.54h-2.64v3.21a1.17 1.17 0 0 1-2.34 0Zm5.06 5.74c1.77 0 2.87-1 2.87-2.38 0-1.56-1.12-2.38-2.87-2.38h-2.72v4.79Zm6.64 4.87 4.94-11a1.48 1.48 0 0 1 1.41-1h.11a1.46 1.46 0 0 1 1.39 1l4.94 11a1 1 0 0 1 .13.49A1.1 1.1 0 0 1 266 41a1.2 1.2 0 0 1-1.14-.82l-1.08-2.49h-6.46l-1.12 2.57a1.12 1.12 0 0 1-1.08.74 1.07 1.07 0 0 1-1.12-1.11 1.2 1.2 0 0 1 .13-.53Zm8.71-3.76-2.34-5.38-2.34 5.38Zm7.31-6.85a1.16 1.16 0 0 1 1.18-1.18h4.75a5.36 5.36 0 0 1 3.84 1.33 4 4 0 0 1 1.1 2.87 3.94 3.94 0 0 1-3 4l2.53 3.23a1.36 1.36 0 0 1 .38.89 1.1 1.1 0 0 1-1.12 1.11 1.34 1.34 0 0 1-1.14-.61l-3.23-4.12h-2.95v3.57a1.17 1.17 0 0 1-2.34 0Zm5.76 5.42c1.67 0 2.74-.87 2.74-2.22 0-1.43-1-2.21-2.76-2.21h-3.4v4.47Zm11.8-4.43h-3.23a1.08 1.08 0 1 1 0-2.17h8.84a1.08 1.08 0 0 1 0 2.17h-3.25v10.08a1.18 1.18 0 0 1-2.36 0Zm9.68-1.06a1.17 1.17 0 0 1 1.18-1.18h.25a1.23 1.23 0 0 1 1.08.63l4 6.31 4-6.33a1.18 1.18 0 0 1 1.1-.61h.25a1.17 1.17 0 0 1 1.18 1.18v11.14a1.16 1.16 0 0 1-1.14 1.18 1.18 1.18 0 0 1-1.16-1.16v-8l-3.25 4.89a1.09 1.09 0 0 1-2 0l-3.23-4.85v8a1.14 1.14 0 0 1-1.12 1.12 1.12 1.12 0 0 1-1.14-1.14ZM314.8 39.7V28.75a1.16 1.16 0 0 1 1.2-1.18h7.74a1.06 1.06 0 0 1 1 1 1 1 0 0 1-1 1h-6.58v3.46h5.72a1.06 1.06 0 0 1 1 1.06 1 1 0 0 1-1 1h-5.72v3.57h6.67a1.05 1.05 0 0 1 1 1 1 1 0 0 1-1 1H316a1.16 1.16 0 0 1-1.2-.96Zm13.47-11.02a1.17 1.17 0 0 1 1.18-1.18h.25a1.47 1.47 0 0 1 1.22.68l6.65 8.61v-8.17a1.15 1.15 0 0 1 2.3 0V39.8a1.14 1.14 0 0 1-1.14 1.2h-.09a1.47 1.47 0 0 1-1.22-.7l-6.84-8.86v8.44a1.15 1.15 0 0 1-2.3 0Zm18.92 1.06H344a1.08 1.08 0 0 1 0-2.17h8.84a1.08 1.08 0 0 1 0 2.17h-3.25v10.08a1.18 1.18 0 0 1-2.36 0Zm15.42 6.79a6 6 0 0 1 5.85-5.89 4.43 4.43 0 0 1 4.71 4.6 6 6 0 0 1-5.85 5.87 4.43 4.43 0 0 1-4.71-4.58Zm8.29-1.24a2.43 2.43 0 0 0-2.57-2.66c-2 0-3.44 2-3.44 3.82a2.43 2.43 0 0 0 2.57 2.66c1.94 0 3.44-2.01 3.44-3.82Zm6.95 4.55a1.38 1.38 0 0 1-1.29 1.16c-.76 0-1.18-.55-.93-1.48l1.81-6.67h-.27a1 1 0 0 1-.87-1 1 1 0 0 1 1-1h.7l.19-.82a3.69 3.69 0 0 1 3.81-3.12 4.56 4.56 0 0 1 1.08.13.89.89 0 0 1 .78.91.93.93 0 0 1-1.06 1 2.42 2.42 0 0 0-.74-.11 1.62 1.62 0 0 0-1.65 1.41l-.15.57h1.62a1 1 0 0 1 0 2h-2.11ZM150.08 62.52V51.57a1.16 1.16 0 0 1 1.18-1.18H159a1.06 1.06 0 0 1 1 1 1 1 0 0 1-1 1h-6.58v3.46h5.72a1.06 1.06 0 0 1 1 1.06 1 1 0 0 1-1 1h-5.72v3.57h6.67a1.05 1.05 0 0 1 1 1 1 1 0 0 1-1 1h-7.83a1.16 1.16 0 0 1-1.18-.96Zm13.47-11.03a1.17 1.17 0 0 1 1.18-1.18h.27a1.47 1.47 0 0 1 1.22.68l6.65 8.61v-8.16a1.15 1.15 0 0 1 2.3 0v11.17a1.14 1.14 0 0 1-1.17 1.16h-.1a1.47 1.47 0 0 1-1.22-.7l-6.84-8.86v8.44a1.15 1.15 0 0 1-2.3 0ZM183 62.94 178.34 52a1.31 1.31 0 0 1-.13-.55 1.15 1.15 0 0 1 1.18-1.14 1.22 1.22 0 0 1 1.2.84l3.84 9.6 3.9-9.68a1.2 1.2 0 0 1 1.12-.76 1.13 1.13 0 0 1 1.16 1.12 1.35 1.35 0 0 1-.11.49l-4.68 11a1.39 1.39 0 0 1-1.35 1h-.13a1.39 1.39 0 0 1-1.34-.98Zm10.72-11.48a1.17 1.17 0 0 1 2.34 0v11.17a1.17 1.17 0 0 1-2.34 0Zm6.7.11a1.16 1.16 0 0 1 1.18-1.18h4.75a5.36 5.36 0 0 1 3.84 1.33 4 4 0 0 1 1.1 2.87 3.94 3.94 0 0 1-3 4l2.55 3.21a1.36 1.36 0 0 1 .38.89 1.1 1.1 0 0 1-1.12 1.08 1.34 1.34 0 0 1-1.14-.61l-3.23-4.12h-2.95v3.57a1.17 1.17 0 0 1-2.34 0Zm5.76 5.43c1.67 0 2.74-.87 2.74-2.22 0-1.43-1-2.21-2.76-2.21h-3.4V57Zm8.01.08a7 7 0 0 1 13.92 0 7 7 0 0 1-13.92 0Zm11.46 0a4.56 4.56 0 0 0-4.52-4.73 4.5 4.5 0 0 0-4.49 4.7 4.54 4.54 0 0 0 4.52 4.71 4.48 4.48 0 0 0 4.5-4.68Zm6.09-5.59a1.17 1.17 0 0 1 1.18-1.18h.25a1.47 1.47 0 0 1 1.22.68l6.61 8.62v-8.17a1.15 1.15 0 0 1 2.3 0v11.17a1.14 1.14 0 0 1-1.14 1.16h-.09a1.47 1.47 0 0 1-1.22-.7L234 54.21v8.44a1.15 1.15 0 0 1-2.3 0Zm15.92 0a1.17 1.17 0 0 1 1.18-1.18h.25a1.23 1.23 0 0 1 1.08.63l4 6.31 4-6.33a1.18 1.18 0 0 1 1.06-.61h.25a1.17 1.17 0 0 1 1.18 1.18v11.14a1.16 1.16 0 0 1-1.18 1.16 1.18 1.18 0 0 1-1.16-1.16v-8l-3.25 4.89a1.09 1.09 0 0 1-2 0L250 54.69v8a1.14 1.14 0 0 1-1.16 1.14 1.12 1.12 0 0 1-1.14-1.14Zm17.42 11.03V51.57a1.16 1.16 0 0 1 1.18-1.18H274a1.06 1.06 0 0 1 1 1 1 1 0 0 1-1 1h-6.58v3.46h5.72a1.06 1.06 0 0 1 1 1.06 1 1 0 0 1-1 1h-5.72v3.57h6.67a1.05 1.05 0 0 1 1 1 1 1 0 0 1-1 1h-7.83a1.16 1.16 0 0 1-1.18-.96Zm13.47-11.03a1.17 1.17 0 0 1 1.18-1.18h.27a1.47 1.47 0 0 1 1.22.68l6.65 8.61v-8.16a1.15 1.15 0 0 1 2.3 0v11.17a1.14 1.14 0 0 1-1.17 1.16h-.1a1.47 1.47 0 0 1-1.22-.7l-6.84-8.86v8.44a1.15 1.15 0 0 1-2.3 0Zm18.91 1.07h-3.23a1.08 1.08 0 1 1 0-2.17h8.84a1.08 1.08 0 0 1 0 2.17h-3.25v10.07a1.18 1.18 0 0 1-2.36 0Zm7.18 9.62 4.94-11a1.48 1.48 0 0 1 1.41-1h.11a1.46 1.46 0 0 1 1.39 1l4.94 11a1 1 0 0 1 .13.49 1.1 1.1 0 0 1-1.1 1.12 1.2 1.2 0 0 1-1.14-.82l-1.08-2.49h-6.46l-1.12 2.57a1.12 1.12 0 0 1-1.08.74 1.07 1.07 0 0 1-1.08-1.08 1.2 1.2 0 0 1 .14-.53Zm8.71-3.76L311 53l-2.34 5.38Zm7.31-6.96a1.17 1.17 0 0 1 2.34 0v10.11h6a1.06 1.06 0 0 1 0 2.13h-7.19a1.16 1.16 0 0 1-1.18-1.18Zm18.4 5.62A7 7 0 0 1 353 57a6.89 6.89 0 0 1-1.35 4.09l.86.7a1.15 1.15 0 0 1 .44.91 1.12 1.12 0 0 1-1.92.78l-1-.86a6.92 6.92 0 0 1-4 1.25 6.75 6.75 0 0 1-6.97-6.79Zm7.19 1.75a1.12 1.12 0 0 1 1.1-1.12 1.13 1.13 0 0 1 .82.34l1.71 1.56a5 5 0 0 0 .65-2.53 4.56 4.56 0 0 0-4.53-4.77 4.5 4.5 0 0 0-4.49 4.7 4.55 4.55 0 0 0 6.82 4.11l-1.65-1.41a1.14 1.14 0 0 1-.43-.88Zm10.25-.78v-6.6a1.17 1.17 0 0 1 2.34 0V58c0 2.47 1.27 3.78 3.37 3.78s3.35-1.24 3.35-3.69v-6.6a1.17 1.17 0 0 1 2.34 0v6.48c0 4-2.24 6-5.72 6s-5.68-2.06-5.68-5.92Zm14 4.13 4.94-11a1.48 1.48 0 0 1 1.41-1h.15a1.46 1.46 0 0 1 1.39 1l4.94 11a1 1 0 0 1 .13.49 1.1 1.1 0 0 1-1.1 1.12 1.2 1.2 0 0 1-1.14-.82l-1.08-2.49h-6.46l-1.12 2.57a1.12 1.12 0 0 1-1.08.74 1.07 1.07 0 0 1-1.08-1.08 1.2 1.2 0 0 1 .1-.53Zm8.71-3.76L376.87 53l-2.34 5.38Zm7.3-6.96a1.17 1.17 0 0 1 2.34 0v10.11h6a1.06 1.06 0 1 1 0 2.13h-7.19a1.16 1.16 0 0 1-1.18-1.18Zm12.49 0a1.17 1.17 0 0 1 2.34 0v11.17a1.17 1.17 0 0 1-2.34 0Zm9.69 1.1h-3.23a1.08 1.08 0 1 1 0-2.17h8.84a1.08 1.08 0 0 1 0 2.17H411v10.07a1.18 1.18 0 0 1-2.36 0Zm13.98 5.97-4.58-6.29a1.44 1.44 0 0 1-.27-.82A1.14 1.14 0 0 1 419 50.3a1.35 1.35 0 0 1 1.14.7l3.71 5.34 3.76-5.34a1.34 1.34 0 0 1 1.12-.7 1.11 1.11 0 0 1 1.14 1.14 1.42 1.42 0 0 1-.32.84L425 58.47v4.16a1.17 1.17 0 0 1-2.34 0Z"
                className="cls-3"
              />
              <path
                d="M149.44 83.65a2.7 2.7 0 0 1-.16-.78 2.06 2.06 0 0 1 2.13-2 2.09 2.09 0 0 1 2 1.48l3.74 11.56 3.77-11.45A2.18 2.18 0 0 1 163 80.8h.32a2.15 2.15 0 0 1 2.1 1.64l3.77 11.45L173 82.33a2.08 2.08 0 0 1 2-1.48 2 2 0 0 1 2 2 2.87 2.87 0 0 1-.16.81l-5.28 14.81a2.3 2.3 0 0 1-2.15 1.7H169a2.24 2.24 0 0 1-2.13-1.7l-3.72-10.8-3.72 10.8a2.24 2.24 0 0 1-2.13 1.7h-.43a2.3 2.3 0 0 1-2.15-1.7Zm31.1 13.55 6.57-14.84a2.56 2.56 0 0 1 2.42-1.64h.24a2.53 2.53 0 0 1 2.4 1.64l6.57 14.84a2 2 0 0 1 .26.8 2 2 0 0 1-2 2 2.11 2.11 0 0 1-2-1.43l-1.27-3h-8.3l-1.32 3.1a2 2 0 0 1-1.91 1.29 1.91 1.91 0 0 1-1.91-1.94 2.19 2.19 0 0 1 .25-.82ZM192.2 92l-2.61-6.22L187 92Zm14.74-7.16h-4A1.91 1.91 0 1 1 203 81h12.12a1.91 1.91 0 1 1 0 3.83h-4V98a2.07 2.07 0 0 1-4.15 0Zm15.51 12.96V83.09a2.06 2.06 0 0 1 2.07-2.09H235a1.86 1.86 0 0 1 1.86 1.86A1.84 1.84 0 0 1 235 84.7h-8.4v3.83h7.19a1.86 1.86 0 0 1 1.86 1.86 1.84 1.84 0 0 1-1.86 1.83h-7.19v4h8.54A1.86 1.86 0 0 1 237 98a1.84 1.84 0 0 1-1.86 1.83h-10.62a2.06 2.06 0 0 1-2.07-2.03Zm20.86-14.71a2.06 2.06 0 0 1 2.08-2.09h6.55a7.51 7.51 0 0 1 5.49 1.91 5.92 5.92 0 0 1 1.57 4.33v.05a5.76 5.76 0 0 1-3.73 5.71l2.88 3.5a2.42 2.42 0 0 1 .67 1.59 1.93 1.93 0 0 1-2 1.91 2.48 2.48 0 0 1-2-1.08l-4-5.12h-3.31V98a2.07 2.07 0 0 1-4.15 0Zm8.35 7.08c2 0 3.18-1.08 3.18-2.67v-.05c0-1.78-1.24-2.69-3.26-2.69h-4.12v5.41Zm-101.87 31.11v-.05a10 10 0 0 1 20-.05v.05a9.68 9.68 0 0 1-1.67 5.41l.81.67a2 2 0 0 1 .75 1.56 1.94 1.94 0 0 1-3.31 1.4l-1-.92a10.27 10.27 0 0 1-5.6 1.62 9.66 9.66 0 0 1-9.98-9.69Zm9.8 2.13a2 2 0 0 1 1.94-2 1.91 1.91 0 0 1 1.37.57l2.07 1.86a6.61 6.61 0 0 0 .51-2.59v-.05a5.73 5.73 0 0 0-5.71-5.93 5.64 5.64 0 0 0-5.66 5.87v.05a5.73 5.73 0 0 0 5.71 5.93 5.67 5.67 0 0 0 2.48-.51l-2-1.67a2 2 0 0 1-.7-1.53Zm16.6-.84v-8.86a2.07 2.07 0 0 1 4.15 0v8.75c0 3.07 1.54 4.66 4.07 4.66s4.07-1.54 4.07-4.53v-8.89a2.07 2.07 0 1 1 4.15 0v8.73c0 5.71-3.21 8.51-8.27 8.51s-8.17-2.82-8.17-8.37Zm21.55 5.43 6.57-14.84a2.56 2.56 0 0 1 2.42-1.64h.27a2.53 2.53 0 0 1 2.4 1.64l6.55 14.84a2 2 0 0 1 .22.84 2 2 0 0 1-2 2 2.11 2.11 0 0 1-2-1.43l-1.27-3h-8.3l-1.32 3.1a2 2 0 0 1-1.91 1.29 1.91 1.91 0 0 1-1.91-1.94 2.19 2.19 0 0 1 .28-.86Zm11.66-5.23-2.61-6.22-2.61 6.22Zm12.36-9.06a2.07 2.07 0 1 1 4.15 0v13.17h7.68a1.89 1.89 0 1 1 0 3.77h-9.75a2.06 2.06 0 0 1-2.07-2.07Zm19.24 0a2.07 2.07 0 1 1 4.15 0v15a2.07 2.07 0 0 1-4.15 0Zm15.56 1.91h-4a1.91 1.91 0 1 1 0-3.83h12.12a1.91 1.91 0 1 1 0 3.83h-4v13.12a2.07 2.07 0 0 1-4.15 0Zm21.3 7.76-6.09-8.27a2.46 2.46 0 0 1-.51-1.48 2 2 0 0 1 2.07-2 2.39 2.39 0 0 1 2 1.27l4.58 6.6 4.66-6.65a2.38 2.38 0 0 1 2-1.24 1.92 1.92 0 0 1 2 2 2.57 2.57 0 0 1-.54 1.45L282 123.3v5.44a2.07 2.07 0 1 1-4.15 0Z"
                className="cls-4"
              />
            </g>
          </g>
        </svg>
      </UtahHeader>

      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-12 items-center justify-between">
                <div className="flex items-center">
                  <div className="hidden md:block">
                    <div className="flex items-baseline space-x-4">
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
                                      queryKey={['notifications', authInfo.id]}
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
                                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
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
                          queryKey={['notifications', authInfo.id]}
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
    </>
  );
}

function NotificationBell({ status, error, items }) {
  return (
    <>
      <span className="sr-only">View notifications</span>
      <BellIcon
        className={clsx('h-6 w-6', {
          'text-amber-400': status !== 'pending' && !error && items?.filter((x) => !x.read).length > 0,
          'text-gray-300': status === 'pending',
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

function Notifications({ status, error, notifications, queryKey }) {
  const queryClient = useQueryClient();
  const { mutate, status: mutateStatus } = useMutation({
    mutationFn: ({ id, key }) =>
      ky
        .put('/api/notification', {
          json: {
            id: id,
            [key]: true,
          },
        })
        .json(),
    onMutate: async ({ id, key }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousValue = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
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

      return { previousValue };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context.previousValue);
      onRequestError(error, 'We had some trouble updating this notification.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  if (['idle', 'pending'].includes(status)) {
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
      case 'inventory_under_review':
        return `${notification.additionalData.name} is reviewing inventory ${notification.additionalData.inventoryId}`;
      case 'inventory_approved':
        return `${notification.additionalData.name} approved inventory ${notification.additionalData.inventoryId}`;
      case 'inventory_authorized':
        return `${notification.additionalData.name} authorized inventory ${notification.additionalData.inventoryId}`;
      case 'inventory_completed':
        return `${notification.additionalData.name} completed inventory ${notification.additionalData.inventoryId}`;
      case 'approved_well_status_edit':
        return `${notification.additionalData.name} changed well status from ${notification.additionalData.oldStatus} to ${notification.additionalData.newStatus} for inventory ${notification.additionalData.inventoryId}`;
      case 'approved_site_contact_addition':
        return `${notification.additionalData.name} added a contact for the approved site ${notification.additionalData.siteId}`;
      case 'approved_site_contact_deletion':
        return `${notification.additionalData.name} removed a contact for the approved site ${notification.additionalData.siteId}`;
      case 'approved_inventory_well_addition':
        return `${notification.additionalData.name} added a well to the submitted inventory ${notification.additionalData.inventoryId}`;
      default:
        return `Other notification: ${notification.event}`;
    }
  };

  return availableNotifications.map((notification) => (
    <div
      key={notification.id}
      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      <span className="px-2">{formatNotification(notification)}</span>
      <span className="flex flex-col">
        <span className="self-center whitespace-nowrap text-xs text-gray-400">
          {dateFormatter.format(Date.parse(notification.createdAt))}
        </span>
        <span className="whitespace-nowrap">
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
                onClick={() => mutateStatus !== 'pending' && mutate({ id: notification.id, key: 'read' })}
              />
            </span>
          )}
          <TrashIcon
            className="ml-1 inline-block h-5 w-5 cursor-pointer text-red-300"
            onClick={() => mutateStatus !== 'pending' && mutate({ id: notification.id, key: 'deleted' })}
          />
        </span>
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
