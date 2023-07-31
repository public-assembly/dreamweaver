import ApolloClient from 'apollo-boost';
import env from '../services/env';

export const apolloClient = new ApolloClient({
  uri:
    env.NODE_ENV === 'production'
      ? 'http://node1.bundlr.network/graphql'
      : 'https://devnet.bundlr.network/graphql',
});
