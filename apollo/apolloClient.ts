import ApolloClient from 'apollo-boost';

export const apolloClient = new ApolloClient({
  uri: 'https://devnet.bundlr.network/graphql',
});
