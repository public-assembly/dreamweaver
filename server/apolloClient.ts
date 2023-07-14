import ApolloClient from 'apollo-boost';

export const client = new ApolloClient({
    uri: 'https://devnet.bundlr.network/graphql',
});
