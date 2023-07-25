import gql from 'graphql-tag';

export const NEW_TRANSACTIONS_QUERY = gql`
  query NewTransactions($owner: String!) {
    transactions(
      owners: [$owner]
      tags: [
        { name: "Content-Type", values: ["application/json"] }
        {
          name: "Press Events"
          values: [
            "Create721Press"
            "DataStored"
            "DataRemoved"
            "DataOverwritten"
            "LogicUpdated"
            "PressInitialized"
            "RendererUpdated"
          ]
        }
      ]
      order: ASC
    ) {
      edges {
        node {
          id
          address
          tags {
            name
            value
          }
        }
      }
    }
  }
`;
