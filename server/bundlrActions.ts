import Bundlr from '@bundlr-network/client';
import { replacer } from './utils';
import { Log } from 'viem';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';

// initialize pollo client to interact with bundlr's graphql api
const client = new ApolloClient({
    uri: 'https://devnet.bundlr.network/graphql',
});

// initialize bundlr
export const bundlr = new Bundlr(
  'http://devnet.bundlr.network',
  'ethereum',
  process.env.PRIVATE_KEY,
  {
    providerUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_RPC_URL}`,
  }
);

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

// type definition

interface Tag {
    name: string;
    value: string;
  }
  
  interface Node {
    id: string;
    tags: Tag[];
  }
  
  interface Edge {
    node: Node;
  }
  
  interface Transactions {
    edges: Edge[];
  }
  
  interface GraphQLResponse {
    transactions: Transactions;
  }

//  gets block number of the last event with a given name 
export async function getLastBlock(eventName: string) {
    console.log(`eventName: ${eventName}`)
    
    // query to get the details of the last event with a given name .. this actually may not even be necessary TODO: check if we can get rid of this query. 
    const query = gql`
    query {
        transactions(
          owners: ["0x6fF78174FD667fD21d82eE047d38dc15b5440d71"]
          tags: [
            { name: "Content-Type", values: ["application/json"] }
            { name: "Press Events", values: ["${eventName}] }
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
    const { data } = await client.query<GraphQLResponse>({ query });
    console.log("GraphQL Response: ", JSON.stringify(data, null, 2));
  
    // if no transactions are found, return the hardcoded block number
    if (data.transactions.edges.length === 0) {
      return BigInt(3570818);
    }
  
    // get the transaction ID of the last transaction that matches the tags
    const transactionId = data.transactions.edges[data.transactions.edges.length - 1].node.id;
    
    // use the transaction ID to fetch the transaction details from Arweave
    const transactionData = await fetch(`https://arweave.net/${transactionId}`).then(response => response.json());
  
    // extract the block number from the last log in the transaction data
    const blockNumber = transactionData ? BigInt(transactionData.blockNumber) : null;
    console.log("Block Number: ", blockNumber); // Debug line
  
    return blockNumber;
  }

// uploads logs given as an object
  
  export async function uploadLogsObject(logsObject: { ToBlock: string, FromBlock: string, Logs: Log[] }, eventName: string) {
    // extract the Logs property from the logsObject
    const { Logs } = logsObject;
  
    // call uploadLogs with the Logs array
    const response = await uploadLogs(Logs, eventName);
  
    return response;
  }