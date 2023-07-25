import gql from 'graphql-tag';

// query to get the details of the last event with a given name
export const LAST_EVENT_QUERY = gql`
  query LastEvent($owner: String!, $eventName: String!) {
    transactions(
      owners: [$owner]
      tags: [
        { name: "Content-Type", values: ["application/json"] }
        { name: "Press Events", values: [$eventName] }
      ]
      order: DESC
      limit: 1
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
