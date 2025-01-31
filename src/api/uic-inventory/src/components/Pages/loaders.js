import ky from 'ky';
import { onRequestError } from '../PageElements';

export const getSiteContacts = (siteId) => ({
  queryKey: ['contacts', siteId],
  queryFn: () => ky.get(`/api/site/${siteId}/contacts`).json(),
  enabled: (siteId ?? 0 > 0) ? true : false,
  onError: (error) => onRequestError(error, 'We had some trouble finding your contacts.'),
});

export const siteContactLoader =
  (queryClient) =>
  async ({ params }) => {
    const query = getSiteContacts(params.siteId);

    return await queryClient.ensureQueryData(query);
  };

export const getSites = (siteId) => ({
  queryKey: ['site', siteId],
  queryFn: () => ky.get(`/api/site/${siteId}`).json(),
  enabled: siteId > 0,
  onError: (error) => onRequestError(error, 'We had some trouble finding your site.'),
});

export const siteLoader =
  (queryClient) =>
  async ({ params }) => {
    const query = getSites(params.siteId ?? 0);

    return await queryClient.ensureQueryData(query);
  };

export const getInventory = (siteId, inventoryId) => ({
  queryKey: ['site', siteId, 'inventory', inventoryId],
  queryFn: () => ky.get(`/api/site/${siteId}/inventory/${inventoryId}`).json(),
  enabled: siteId > 0,
  onError: (error) => onRequestError(error, 'We had some trouble finding this wells information.'),
});

export const inventoryLoader =
  (queryClient) =>
  async ({ params }) => {
    const query = getInventory(params.siteId, params.inventoryId ?? -1);

    return await queryClient.ensureQueryData(query);
  };

export const getSerContact = (siteId) => ({
  queryKey: ['ser-contacts', siteId],
  queryFn: async () => {
    const response = await ky.get(`/api/site/${siteId}/contacts`).json();

    return {
      ...response,
      contacts: response.contacts.filter((contact) => contact.contactType === 'project_manager'),
    };
  },
  enabled: (siteId ?? 0 > 0) ? true : false,
  onError: (error) => onRequestError(error, 'We had some trouble finding your contacts.'),
});

export const serContactLoader =
  (queryClient) =>
  async ({ params }) => {
    const query = getSerContact(params.siteId);

    return await queryClient.ensureQueryData(query);
  };

export const getLoggedInUserQuery = () => ({
  queryKey: ['auth'],
  queryFn: () => ky.get(`/api/me`).json(),
  staleTime: Infinity,
  onError: (error) => onRequestError(error, 'We had some trouble finding your profile.'),
});
export const loggedInUserLoader = (queryClient) => async () => {
  const query = getLoggedInUserQuery();

  return await queryClient.ensureQueryData(query);
};
