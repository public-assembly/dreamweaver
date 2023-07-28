import { EventObject } from '../types';
import { replacer } from '../utils';
import { fetchLogs } from '.';
import { APLogs } from '../interfaces/transactionInterfaces';
import { processCleanedLogs } from '../processAndUpload';
import { AP721DatabaseV1Abi } from '../abi/AP721DatabaseV1Abi';
import {  events, optimism_goerli } from '../constants';
import { apolloClient } from "../apollo/apolloClient";
import { LAST_EVENT_QUERY } from "../gql";
import { getContractCreationTxn } from "../utils";
import { viemClient } from "../viem/client";
import { uploadLogs } from '../bundlr';
import env from '../services/env';

function convertArgs(args: object): APLogs['args'] | undefined {
  const convertedArgs: Partial<APLogs['args']> = {};

  for (const key in args) {
    if (Object.prototype.hasOwnProperty.call(args, key)) {
      (convertedArgs as Record<string, any>)[key] = (args as Record<string, any>)[key];
    }
  }

  return convertedArgs as APLogs['args']; // Cast to APLogs['args'] to assert the final type
}

function convertLog(log: any): APLogs { 
  return {
    address: log.address,
    blockHash: log.blockHash,
    blockNumber: log.blockNumber,
    data: log.data,
    topics: log.topics,
    transactionHash: log.transactionHash,
    args: convertArgs(log.args as object), // Cast args to object
    eventName: log.eventName
  };
}

async function getLastBlockNum() {
  const { data } = await apolloClient.query({ query: LAST_EVENT_QUERY, variables: { owner: env.OWNER } });
  const apiUrl = `https://api-goerli-optimistic.etherscan.io/api?module=contract&action=getcontractcreation&contractaddresses=${env.CONTRACT_ADDRESS}&apikey=${env.OPTIMISM_GOERLI_API_KEY}`;

  if (!data.transactions.edges.length) {
    const txn = await getContractCreationTxn(apiUrl);
    const txnResult = txn?.result?.[0];
    if (!txnResult) {
      console.error('No contract creation transaction found or an error occurred while fetching');
      return;
    }

    const txnHash = txnResult.txHash;
    console.log('contractCreationTxn:', txn, 'contract transaction hash:', txnHash);

    const { blockNumber } = await viemClient.getTransaction({ hash: txnHash });
    console.log(`Starting indexing when contract was created @ block number: ${blockNumber}`);

    return blockNumber;
  }

  const txnId = data.transactions.edges[0].node.id;
  const [txnData] = await (await fetch(`https://arweave.net/${txnId}`)).json();

  console.log('transactiondata', txnData);
  return txnData?.blockNumber;
}

export async function getEvents() {
  console.log('Fetching events...');

  const eventObjects: EventObject[] = [ 
  {
      event: events.DATA_OVERWRITTEN,
      abi: AP721DatabaseV1Abi ,
      address: optimism_goerli.AP721DATABASEV1,
    },
    {       
      event: events.DATA_REMOVED,
      abi: AP721DatabaseV1Abi,
      address: optimism_goerli.AP721DATABASEV1,
    },
    {       
      event: events.DATA_STORED,
      abi: AP721DatabaseV1Abi,
      address: optimism_goerli.AP721DATABASEV1,
    },
    {       
      event: events.LOGIC_UPDATED,
      abi: AP721DatabaseV1Abi,
      address: optimism_goerli.AP721DATABASEV1,
    },
    {       
      event: events.RENDERER_UPDATED,
      abi: AP721DatabaseV1Abi,
      address: optimism_goerli.AP721DATABASEV1,
    },
    {       
      event: events.SETUP_AP721,
      abi: AP721DatabaseV1Abi,
      address: optimism_goerli.AP721DATABASEV1,
    },
  ]

  const currentBlock = await viemClient.getBlockNumber();
  console.log(`Current block number is ${currentBlock}`);

  let fromBlock = await getLastBlockNum();
  const initialFromBlock = fromBlock; 

  const fetchPromises = [];

while (fromBlock <= currentBlock) {
  console.log('From Block DAWG: ', fromBlock);
  let toBlock: bigint =
    fromBlock + BigInt(10000) > currentBlock
      ? currentBlock
      : fromBlock + BigInt(10000);

  // Push the fetchLogs promise into the array
  fetchPromises.push(fetchLogs(fromBlock, toBlock, eventObjects));

  fromBlock = toBlock + BigInt(1);
}

// Wait for all fetch operations to complete
const allLogsArrays = await Promise.all(fetchPromises);

// Flatten the array of arrays into a single array
const allLogs = allLogsArrays.flat();

// Now you can sort allLogs
allLogs.sort((a, b) => {
  if (a.blockNumber === null || b.blockNumber === null) {
    return 0;
  }
  return  Number(b.blockNumber) - Number(a.blockNumber);
});

  const cleanedLogs = allLogs.map(convertLog);

  if (cleanedLogs.length === 0) {
    console.log('No logs to return.');
    return {
      cleanedLogs: [],
      logsJson: '{}',
      eventName: eventObjects[0].event,
    };
  }

  const logsJson = JSON.stringify({
    jobAnalysis: {
      fromBlock: String(initialFromBlock),
      toBlock: String(currentBlock),
    },
    logs: {
      allEvents: cleanedLogs,
    },
  }, replacer, 2);
  console.log('Returning logs...');

  await processCleanedLogs(cleanedLogs);

    if (cleanedLogs.length > 0) {
      await uploadLogs(cleanedLogs);
    }

  return { logsJson, cleanedLogs, eventName: eventObjects[0].event };
  
}

//?