import memCache from 'graphql-hooks-memcache';

import { GraphQLClient, ClientContext } from 'graphql-hooks';
export { useQuery, useMutation } from 'graphql-hooks';

export * from './gql';

const client = new GraphQLClient({
  url: '/graphql',
  cache: memCache(),
});

export { client, ClientContext };
