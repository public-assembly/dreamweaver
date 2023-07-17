import { replacer } from '../utils';
import { bundlr } from './bundlrInit';
import { apolloClient } from '../apolloClient';
import { Log } from 'viem';
import gql from 'graphql-tag';
import 'dotenv/config';
import { Tag, Node, Edge, Transactions, GraphQLResponse } from '../interfaces/transactionInterfaces';

// creates metadata tags for Bundlr uploads that will help us identify our uploads in our query later on
export const createBundlrTags = (eventName: string) => [
  { name: 'Content-Type', value: 'application/json' },
  { name: 'Press Events', value: eventName },
];

// upload an array of logs to Arweave via Bundlr
export async function uploadLogs(logs: Log[], eventName: string) {
  const tags = createBundlrTags(eventName);

  // upload logs as a stringified JSON
  const response = await bundlr.upload(JSON.stringify(logs, replacer, 2), {
    tags,
  });
  // log the url of uploaded logs
  console.log(`Uploaded logs: https://arweave.net/${response.id}`);
  return response;
}

//  gets block number of the last event with a given name
export async function getLastBlock(eventName: string) {
  console.log(`eventName: ${eventName}`);

const owner = process.env.OWNER;

  // query to get the details of the last event with a given name
  const query = gql`
    query {
        transactions(
          owners: ["${owner}"]
          tags: [
            { name: "Content-Type", values: ["application/json"] }
            { name: "Press Events", values: ["${eventName}"] }
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
  // perform query
  const { data } = await apolloClient.query<GraphQLResponse>({ query });
  console.log('GraphQL Response: ', JSON.stringify(data, null, 2));

  // if no transactions are found, return the hardcoded block number
  if (data.transactions.edges.length === 0) {
    return BigInt(3570818);
  }

  // get the transaction ID of the last transaction that matches the tags
  const transactionId =
    data.transactions.edges[data.transactions.edges.length - 1].node.id;

  // use the transaction ID to fetch the transaction details from Arweave
  const transactionData = await fetch(
    `https://arweave.net/${transactionId}`
  ).then((response) => response.json());

  // extract the block number from the last log in the transaction data
  const blockNumber = transactionData ? transactionData[0]?.blockNumber : null;

  return blockNumber;
}

// uploads logs given as an object
export async function uploadLogsObject(
  logsObject: { ToBlock: string; FromBlock: string; Logs: Log[] },
  eventName: string
) {
  // extract the Logs property from the logsObject
  const { Logs } = logsObject;

  // call uploadLogs with the Logs array
  const response = await uploadLogs(Logs, eventName);

  return response;
}
