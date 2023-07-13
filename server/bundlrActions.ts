import Bundlr from '@bundlr-network/client';
import { replacer } from './utils';
import { Log } from 'viem';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';

// initialize apollo 
const client = new ApolloClient({
    uri: 'https://devnet.bundlr.network/graphql',
});

// Initialize Bundlr
export const bundlr = new Bundlr(
  'http://devnet.bundlr.network',
  'ethereum',
  process.env.PRIVATE_KEY,
  {
    providerUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_RPC_URL}`,
  }
);

// Metadata for Bundlr uploads
export const createBundlrTags = (eventName: string) => [
  { name: 'Content-Type', value: 'application/json' },
  { name: 'Press Events', value: eventName },
];

// Uploads an array of logs to Arweave. 
export async function uploadLogs(logs: Log[], eventName: string) {
    const tags = createBundlrTags(eventName);
  
    const response = await bundlr.upload(JSON.stringify(logs, replacer, 2), {
      tags,
    });
  
    console.log(`Uploaded logs: https://arweave.net/${response.id}`);
    return response;
  }

// FETCH lastBlock FROM LAST EVENT IN TRANSACTION HASH ID

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

// FETCH lastBlock FROM LAST EVENT IN TRANSACTION HASH ID
export async function getLastBlock(eventName: string) {
    console.log(`eventName: ${eventName}`)
    
    const query = gql`
      query {
        transactions(
          tags: [
            { name: "Content-Type", values: ["application/json"] }
            { name: "Press Events", values: ["${eventName}"] }
          ]
        ) {
          edges {
            node {
              id
              tags {
                name
                value
              }
            }
          }
        }
      }
    `;
  
    const { data } = await client.query<GraphQLResponse>({ query });
    console.log("GraphQL Response: ", JSON.stringify(data, null, 2));
  
    // If no transactions are found, return the hardcoded block number
    if (data.transactions.edges.length === 0) {
      return BigInt(3570818);
    }
  
    // Get the transaction ID of the last transaction that matches the tags
    const transactionId = data.transactions.edges[data.transactions.edges.length - 1].node.id;
    
    // Now use the transaction ID to fetch the transaction details from Arweave
    const transactionData = await fetch(`https://arweave.net/${transactionId}`).then(response => response.json());
  
    // Extract the block number from the last log in the transaction data
    const blockNumber = transactionData ? BigInt(transactionData.blockNumber) : null;
    console.log("Block Number: ", blockNumber); // Debug line
  
    return blockNumber;
  }