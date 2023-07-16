import gql from 'graphql-tag';

// TODO: don't hardcode `owners`
export const NEW_TRANSACTIONS = gql`
  query {
    transactions(
      owners: ["0x6fF78174FD667fD21d82eE047d38dc15b5440d71"]
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