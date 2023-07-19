import { replacer } from '../utils';
import { bundlr } from './bundlrInit';
import { apolloClient } from '../apolloClient';
import { Log } from 'viem';
import gql from 'graphql-tag';
import 'dotenv/config';
import { viemClient } from '../viem';
import { Tag, Node, Edge, Transactions, GraphQLResponse , APLogs} from '../interfaces/transactionInterfaces';

// pass address you want to query. 
const OWNER = process.env.OWNER;
// for fetching txn hash + contract creation block number
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// Check required environment variables
if (!OWNER || !CONTRACT_ADDRESS || !ETHERSCAN_API_KEY) {
  throw new Error('Missing necessary environment variables');
}

// creates metadata tags for Bundlr uploads that will help us identify our uploads in our query later on
export const createBundlrTags = (eventName: string) => [
  { name: 'Content-Type', value: 'application/json' },
  { name: 'Press Events', value: eventName },
];

// upload an array of logs to Arweave via Bundlr ORIGINAL
// export async function uploadLogs(logs: APLogs[], eventName: string) {
//   const tags = createBundlrTags(eventName);

//   // upload logs as a stringified JSON
//   const response = await bundlr.upload(JSON.stringify(logs, replacer, 2), {
//     tags,
//   });
//   // log the url of uploaded logs
//   console.log(`Uploaded logs: https://arweave.net/${response.id}`);
//   return response;
// }

export async function uploadLogs(logs: APLogs[], eventName: string) {
  const tags = createBundlrTags(eventName);

  // upload logs as a stringified JSON
  const response = await bundlr.upload(JSON.stringify(logs, replacer, 2), {
    tags,
  });
  // log the url of uploaded logs
  console.log(`Uploaded logs: https://arweave.net/${response.id}`);
  return { response, cleanedLogs: logs };
}
//  gets block number of the last event or if no last event is present return contract creation block number
export async function getLastBlock(eventName: string) {

  // query to get the details of the last event with a given name
  const query = gql`
    query {
        transactions(
          owners: ["${OWNER}"]
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

  // if no event transactions are found, return the block number of when the contract was created
  
const apiUrl = `https://api-sepolia.etherscan.io/api?module=contract&action=getcontractcreation&contractaddresses=${CONTRACT_ADDRESS}&apikey=${ETHERSCAN_API_KEY}`;

  if (data.transactions.edges.length === 0) {
    // get contract creation transaction
    const contractCreationTxn = await getContractCreationTxn(apiUrl);
    
    if (!contractCreationTxn || !contractCreationTxn.result || contractCreationTxn.result.length === 0) {
      console.error('No contract creation transaction found or an error occurred while fetching');
      return; // decide how to handle this case
    }

    // get the transaction hash
    const contractCreationTxnHash = contractCreationTxn.result[0].txHash;
    console.log(`this is contractCreationTXN: `, contractCreationTxn)

    // use the Viem's Get Transaction API to get the transaction details
    console.log(`contract transaction hash: ${contractCreationTxnHash}`);
    const transaction = await viemClient.getTransaction({ hash: contractCreationTxnHash });

    // get the block number from the response
    const contractCreationBlockNumber = transaction.blockNumber;
    
    console.log(`Starting indexing when contract was created @ block number: ${contractCreationBlockNumber}`);
    return contractCreationBlockNumber;
  }

  // get the transaction ID of the last transaction that matches the tags
  const transactionId =
  data.transactions.edges[data.transactions.edges.length - 1].node.id;

  // use the transaction ID to fetch the transaction details from Arweave
  const transactionData = await fetch(
    `https://arweave.net/${transactionId}`)
    .then((response) => response.json());

  // extract the block number from the last log in the transaction data
  const blockNumber = transactionData ? transactionData[0]?.blockNumber : null;

  return blockNumber;
}

async function getContractCreationTxn(apiUrl: string) { 
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('An error occurred while fetching contract creation transaction:', error);
  }
}
  
// uploads logs given as an object
export async function uploadLogsObject(
  logsObject: { ToBlock: string; FromBlock: string; Logs: APLogs[] },
  eventName: string
) {
  // extract the Logs property from the logsObject
  const { Logs } = logsObject;

  // call uploadLogs with the Logs array
  const response = await uploadLogs(Logs, eventName);


  return response;
}
