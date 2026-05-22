import { API_URL_PROD, configureClient } from '@0xintuition/graphql';

const graphqlUrl =
  import.meta.env.VITE_INTUITION_GRAPHQL_URL ?? API_URL_PROD;

configureClient({ apiUrl: graphqlUrl });
