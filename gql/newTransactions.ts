import gql from 'graphql-tag';
import 'dotenv/config';

// pass address you want to query 
const owner = process.env.OWNER;

export const NEW_TRANSACTIONS = gql`
  query {
    transactions(
      owners: ["${owner}"]
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