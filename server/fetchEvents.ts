import { client} from './viem';
import type { Hex, Abi, Log } from 'viem';
import { getLastBlock, uploadLogs, uploadLogsObject } from './bundlrActions'
import { ERC721PressFactoryAbi, CurationDatabaseV1Abi } from './abi';
import { sepolia, events } from './constants';
import { replacer } from './utils';

type EventObject = {
  event: string;
  abi: Abi;
  address: Hex;
};

async function fetchLogs(
  fromBlock: bigint, 
  toBlock: bigint, 
  eventObjects: EventObject[]
  ) {
  const filters = await Promise.all(
    eventObjects.map((eventObject) => 
      client.createContractEventFilter({
        abi: eventObject.abi,
        address: eventObject.address,
        eventName: eventObject.event,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      }))
  );

  console.log(`Filter created for blocks ${fromBlock} to ${toBlock}, getting logs...`);

  const logs = await Promise.all(
    filters.map((filter, index) => 
      client
      // TODO: type this as 'Filter' once viem has been updated to export that type
        .getFilterLogs({ filter: filter as any })
        .then(logs => logs.map(log => ({ ...log, eventName: eventObjects[index].event }))))
  );

  return logs.flat();
}

export async function getEvents() {
  console.log('Fetching events...');

  const allLogs = [];

  const eventObjects: EventObject[] = [
    {
      event: events.CREATE_PRESS,
      abi: ERC721PressFactoryAbi,
      address: sepolia.ERC721_PRESS_FACTORY,
    },
    {
      event: events.DATA_STORED,
      abi: CurationDatabaseV1Abi,
      address: sepolia.CURATION_DATABASE_V1,
    },
    {
      event: events.DATA_REMOVED,
      abi: CurationDatabaseV1Abi,
      address: sepolia.CURATION_DATABASE_V1,
    },
    {
      event: events.DATA_OVERWRITTEN,
      abi: CurationDatabaseV1Abi,
      address: sepolia.CURATION_DATABASE_V1,
    },
    {
      event: events.LOGIC_UPDATED,
      abi: CurationDatabaseV1Abi,
      address: sepolia.CURATION_DATABASE_V1,
    },
    {
      event: events.PRESS_INITIALIZED,
      abi: CurationDatabaseV1Abi,
      address: sepolia.CURATION_DATABASE_V1,
    },
    {
      event: events.RENDERER_UPDATED,
      abi: CurationDatabaseV1Abi,
      address: sepolia.CURATION_DATABASE_V1,
    },
  ];

  const currentBlock = await client.getBlockNumber();
  console.log(`Current block number is ${currentBlock}`);


  const eventName = eventObjects[eventObjects.length - 1].event; // Use the last event
  let fromBlock = await getLastBlock(eventName);

  console.log(`event: ${eventName}`)
  
  if (fromBlock === null) {
    fromBlock = BigInt(3570818); // Replace with your hardcoded block number
  }

  while (fromBlock <= currentBlock) {
    console.log("From Block: ", fromBlock); // Debug line
    let toBlock: bigint = fromBlock + BigInt(10000) > currentBlock ? currentBlock : fromBlock + BigInt(10000);
  
    const logs = await fetchLogs(fromBlock, toBlock, eventObjects);
    console.log(`Fetched ${logs.length} logs from block ${fromBlock} to ${toBlock}`);
    if (logs.length > 0) {
      allLogs.push(...logs);
    }
  
    fromBlock = toBlock + BigInt(1);
  }

  if (allLogs.length === 0) {
    console.log('No logs to return.');
    return '{}';
  }
  
// ORIGINAL
//   const logsJson = JSON.stringify(allLogs, replacer, 2);
//   console.log('Returning logs...')
  
  
//   // Upload all logs at once
//   const response = await uploadLogs(allLogs, eventObjects[0].event);
  
//   return { logsJson, eventName: eventObjects[0].event };
// }


// Create a new object with ToBlock, FromBlock and Logs

const logsObject = {
  FromBlock: fromBlock.toString(),
  ToBlock: currentBlock.toString(),
  Logs: allLogs
};

const logsJson = JSON.stringify(logsObject, replacer, 2);
console.log('Returning logs...')

// Upload all logs at once
const response = await uploadLogsObject(logsObject, eventObjects[0].event);

return { logsJson, eventName: eventObjects[0].event };
}