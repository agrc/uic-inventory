import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router';
import { Notifications } from './Navigation';

export default {
  title: 'PageElements/Notifications',
  component: Notifications,
};

const sampleNotifications = [
  {
    id: 'notification-1',
    event: 'inventory_submission',
    createdAt: '2026-03-20T16:15:00.000Z',
    additionalData: {
      name: 'Alex Morgan',
      inventoryId: 'INV-2401',
    },
    read: false,
    deleted: false,
    url: '/inventories/INV-2401',
  },
  {
    id: 'notification-2',
    event: 'approved_site_contact_addition',
    createdAt: '2026-03-20T14:05:00.000Z',
    additionalData: {
      name: 'Taylor Brooks',
      siteId: 'SITE-99',
    },
    read: true,
    readAt: '2026-03-20T15:00:00.000Z',
    deleted: false,
    url: '/sites/SITE-99',
  },
  {
    id: 'notification-3',
    event: 'approved_inventory_well_addition',
    createdAt: '2026-03-20T12:30:00.000Z',
    additionalData: {
      name: 'Jordan Lee',
      inventoryId: 'INV-2388',
    },
    read: false,
    deleted: false,
    url: '/inventories/INV-2388',
  },
];

const createQueryClient = (notifications = []) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: Number.POSITIVE_INFINITY,
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  queryClient.setQueryData(['notifications', 'story-user-1'], { notifications });

  return queryClient;
};

function StoryWrapper({ args }) {
  useEffect(() => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });

    return () => {
      globalThis.fetch = originalFetch;
    };
  }, []);

  return (
    <MemoryRouter>
      <QueryClientProvider client={createQueryClient(args.notifications)}>
        <div className="max-w-2xl bg-white p-4">
          <Notifications {...args} />
        </div>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const Template = {
  render: (args) => <StoryWrapper args={args} />,
};

export const Default = {
  ...Template,
  args: {
    status: 'success',
    error: null,
    notifications: sampleNotifications,
    queryKey: ['notifications', 'story-user-1'],
  },
};

export const Empty = {
  ...Template,
  args: {
    status: 'success',
    error: null,
    notifications: [],
    queryKey: ['notifications', 'story-user-1'],
  },
};

export const Loading = {
  ...Template,
  args: {
    status: 'pending',
    error: null,
    notifications: undefined,
    queryKey: ['notifications', 'story-user-1'],
  },
};
