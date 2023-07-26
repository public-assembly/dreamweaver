import { replacer, getContractCreationTxn } from '../utils';
import { bundlr } from './bundlrInit';
import { apolloClient } from '../apollo/apolloClient';
import { LAST_EVENT_QUERY } from '../gql';
import { viemClient } from '../viem/client';
import { GraphQLResponse, APLogs } from '../interfaces/transactionInterfaces';
import env from '../services/env';

// create metadata tags for Bundlr uploads that will help us identify our uploads later on
export const createBundlrTags = (eventName: string) => [
  { name: 'Content-Type', value: 'application/json' },
  { name: 'Press Events', value: eventName },
];

// upload logs as a stringified JSON
export async function uploadLogs(logs: APLogs[], eventName: string) {
  const tags = createBundlrTags(eventName);

  const response = await bundlr.upload(JSON.stringify(logs, replacer, 2), {
    tags,
  });

  console.log(`Uploaded logs: https://arweave.net/${response.id}`);

  return { response, cleanedLogs: logs };
}
// get block number of the last event, if no events exist the return contract creation block number
export async function getLastBlock(eventName: string) {
  const { data } = await apolloClient.query<GraphQLResponse>({
    query: LAST_EVENT_QUERY,
    variables: { owner: env.OWNER, eventName: eventName },
  });

  // const etherscanApiUrl = `https://api-sepolia.etherscan.io/api?module=contract&action=getcontractcreation&contractaddresses=${env.CONTRACT_ADDRESS}&apikey=${env.ETHERSCAN_API_KEY}`;
  const optimism_goerliApiUrl = `https://api-goerli-optimistic.etherscan.io/api?module=contract&action=getcontractcreation&contractaddresses=${env.CONTRACT_ADDRESS}&apikey=${env.OPTIMISM_GOERLI_API_KEY}`

  // if no event transactions are found, return the block number of when the contract was created
  if (data.transactions.edges.length === 0) {
    // get contract creation transaction
    // const contractCreationTxn = await getContractCreationTxn(etherscanApiUrl);
    const contractCreationTxn = await getContractCreationTxn(optimism_goerliApiUrl);

    if (
      !contractCreationTxn ||
      !contractCreationTxn.result ||
      contractCreationTxn.result.length === 0
    ) {
      console.error(
        'No contract creation transaction found or an error occurred while fetching'
      );
      return; // TODO: decide how to handle this case
    }

    // get the transaction hash
    const contractCreationTxnHash = contractCreationTxn.result[0].txHash;
    console.log(`contractCreationTxn: `, contractCreationTxn);

    // use the Viem's Get Transaction API to get the transaction details
    console.log(`contract transaction hash: ${contractCreationTxnHash}`);
    const transaction = await viemClient.getTransaction({
      hash: contractCreationTxnHash,
    });

    // get the block number from the response
    const contractCreationBlockNumber = transaction.blockNumber;

    console.log(
      `Starting indexing when contract was created @ block number: ${contractCreationBlockNumber}`
    );
    return contractCreationBlockNumber;
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
  logsObject: { ToBlock: string; FromBlock: string; Logs: APLogs[] },
  eventName: string
) {
  // extract the Logs property from the logsObject
  const { Logs } = logsObject;

  // call uploadLogs with the Logs array
  const response = await uploadLogs(Logs, eventName);

  return response;
}
