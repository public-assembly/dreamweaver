import { client } from './viem';
import type { Hex } from 'viem';
import { getLastCheckedBlock, updateLastCheckedBlock } from './lastBlockCheck';
import Bundlr from '@bundlr-network/client';
import { ERC721PressFactoryAbi, CurationDatabaseV1Abi } from './abi';
import { SEPOLIA_ADDRESSES } from './contractAddresses/addresses';


type EthereumAddress = Hex;

// Constants
const ERC721PFABI = ERC721PressFactoryAbi;
const ERC721_PRESS_FACTORY_ADDRESS = SEPOLIA_ADDRESSES.ERC721.ERC721_PRESS_FACTORY_PROXY as EthereumAddress;
const CREATE_PRESS_EVENT = 'Create721Press';
const CURATION_DATABASE_ADDRESS = SEPOLIA_ADDRESSES.ERC721.CURATION_DATABASE_V1 as EthereumAddress; 
const CURATION_V1_ABI = CurationDatabaseV1Abi; 
const DATA_STORED_EVENT = 'DataStored';
const RENDER_UPDATED_EVENT = 'RendererUpdated';
const LOGIC_UPDATED_EVENT = 'LogicUpdated';
const PRESS_INITIALIZED_EVENT = 'PressInitialized';

// Initialize Bundlr
const bundlr = new Bundlr(
  'http://devnet.bundlr.network',
  'ethereum',
  process.env.PRIVATE_KEY,
  {
    providerUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_RPC_URL}`,
  }
);

const replacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

const createBundlrTags = (eventName: string) => [
    { name: 'Content-Type', value: 'application/json' },
    { name: 'Press Events', value: eventName },
];

type EventObject = {
  event: string,
  abi: any,
  address: Hex
}

// request counter
let requestCounter = 0;

async function fetchLogs(fromBlock: bigint, toBlock: bigint, eventObjects: EventObject[]) {
  // ORIGINAL
  // const filters = await Promise.all(
  //   eventObjects.map((eventObject) => client.createContractEventFilter({
  //     abi: eventObject.abi,
  //     address: eventObject.address,
  //     eventName: eventObject.event,
  //     fromBlock: BigInt(fromBlock),
  //     toBlock: BigInt(toBlock),
  //   }))
  // );

  // TEMP COUNT CHECK //

  const filters = await Promise.all(
    eventObjects.map((eventObject) => {
      requestCounter++;
      console.log(`Request count: ${requestCounter}`);
      return client.createContractEventFilter({
        abi: eventObject.abi,
        address: eventObject.address,
        eventName: eventObject.event,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      });
    })
  );


  console.log(`Filter created for blocks ${fromBlock} to ${toBlock}, getting logs...`);

  // Return a list of event logs since the filter was created. ORIGINAL
//   const logs = await Promise.all(
//     filters.map((filter, index) => 
//       client.getFilterLogs({ filter: filter as any })
//         .then(logs => logs.map(log => ({ ...log, eventName: eventObjects[index].event }))))
//   );

//   return logs.flat();
// }

// TEMP COUNT CHECK //

const logs = await Promise.all(
  filters.map((filter, index) => {
    requestCounter++;
    console.log(`Request count: ${requestCounter}`);
    return client.getFilterLogs({ filter: filter as any })
      .then(logs => logs.map(log => ({ ...log, eventName: eventObjects[index].event })));
  })
);

return logs.flat();
}

// ORIGINAL 

// async function uploadLog(log: any, eventName: string) {
//   const tags = createBundlrTags(eventName);

//   const response = await bundlr.upload(JSON.stringify(log, replacer, 2), { tags });

//   console.log(`Uploaded log: https://arweave.net/${response.id}`);
//   return log;
// }

// async function uploadLogsGrouped(logs: any[], eventName: string) {
//   const tags = createBundlrTags(eventName);

//   const response = await bundlr.upload(JSON.stringify(logs, replacer, 2), { tags });

//   console.log(`Uploaded logs: https://arweave.net/${response.id}`);
//   return logs;
// }

// TEMPORARY

async function uploadLog(log: any, eventName: string) {
  requestCounter++;
  console.log(`Request count: ${requestCounter}`);
  const tags = createBundlrTags(eventName);

  const response = await bundlr.upload(JSON.stringify(log, replacer, 2), { tags });

  console.log(`Uploaded log: https://arweave.net/${response.id}`);
  return log;
}

async function uploadLogsGrouped(logs: any[], eventName: string) {
  requestCounter++;
  console.log(`Request count: ${requestCounter}`);
  const tags = createBundlrTags(eventName);

  const response = await bundlr.upload(JSON.stringify(logs, replacer, 2), { tags });

  console.log(`Uploaded logs: https://arweave.net/${response.id}`);
  return logs;
}

export async function getPressCreationEvents() {
  console.log('Fetching press creation events...');

  const currentBlock = await client.getBlockNumber();
  console.log(`Current block number is ${currentBlock}`);

  let fromBlock = await getLastCheckedBlock();
  const allLogs = [];

  const eventObjects: EventObject[] = [
    { event: CREATE_PRESS_EVENT, abi: ERC721PFABI, address: ERC721_PRESS_FACTORY_ADDRESS },
    { event: DATA_STORED_EVENT, abi: CURATION_V1_ABI, address: CURATION_DATABASE_ADDRESS },
    { event: RENDER_UPDATED_EVENT, abi: CURATION_V1_ABI, address: CURATION_DATABASE_ADDRESS },
    { event: LOGIC_UPDATED_EVENT, abi: CURATION_V1_ABI, address: CURATION_DATABASE_ADDRESS },
    { event: PRESS_INITIALIZED_EVENT, abi: CURATION_V1_ABI, address: CURATION_DATABASE_ADDRESS },
];
  // new request count 
  let requestCount = 0; 

  // TIMEOUT DEBUG

  function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });
  
    return Promise.race([
      promise.then(result => {
        clearTimeout(timeoutId);
        return result;
      }),
      timeoutPromise
    ]);
  }

  while (fromBlock <= currentBlock) {
    // const toBlock = fromBlock + BigInt(1);
    // log every 100th block 
    const toBlock = fromBlock + BigInt(100 ) > currentBlock ? currentBlock : fromBlock + BigInt(100);

    // const logs = await fetchLogs(fromBlock, toBlock, eventObjects);
    const logs = await withTimeout(
      fetchLogs(fromBlock, toBlock, eventObjects),
      5000,  // Timeout after 5000 milliseconds (5 seconds)
      `fetchLogs timed out for blocks ${fromBlock} to ${toBlock}`
    );
    
    requestCount += 1; 
    console.log(`Request count: ${requestCount}`)
    
    // Separate CreatePress logs and other logs
    const createPressLogs = logs.filter(log => log.eventName === CREATE_PRESS_EVENT);
    const otherLogs = logs.filter(log => log.eventName !== CREATE_PRESS_EVENT);

    // Upload CreatePress logs one by one
    const uploadCreatePressPromises = createPressLogs.map(log => uploadLog(log, log.eventName));
    const uploadedCreatePressLogs = await Promise.all(uploadCreatePressPromises);

    // Upload other logs in one receipt
    if (otherLogs.length > 0) {
      const uploadReceipt = await uploadLogsGrouped(otherLogs, 'Combined Receipt');
      allLogs.push(uploadReceipt);
    }

    allLogs.push(...uploadedCreatePressLogs);

    console.log(`Updating last checked block number to ${toBlock}`);
    await updateLastCheckedBlock(toBlock);

    fromBlock = toBlock + BigInt(1);
  }

  if (allLogs.length === 0) {
    console.log('No logs to return.');
    return '{}';
  }

  const logsJson = JSON.stringify(allLogs, replacer, 2);
  console.log('Returning logs...');
  return logsJson;
}

console.log('Starting to fetch press creation events...');
getPressCreationEvents();
