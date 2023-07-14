import { client } from './viem';
import type { Hex, Abi } from 'viem';
import { getLastBlock, uploadLogs } from './bundlrActions'
import { ERC721PressFactoryAbi, CurationDatabaseV1Abi } from './abi';
import { sepolia, events } from './constants';
import { replacer } from './utils';

// define the structure of EventObject
type EventObject = {
  event: string;
  abi: Abi;
  address: Hex;
};

// function to fetch logs for given blocks and event objects
async function fetchLogs(
  fromBlock: bigint, 
  toBlock: bigint, 
  eventObjects: EventObject[]
  ) {

 // create event filters for each eventObject   
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

// fetch logs for each filter
  const logs = await Promise.all(
    filters.map((filter, index) => 
      client
// TODO: type this as 'Filter' once viem has been updated to export that type
        .getFilterLogs({ filter: filter as any })
        .then(logs => logs.map(log => ({ ...log, eventName: eventObjects[index].event }))))
  );

  return logs.flat();
}
// function to get all events
export async function getEvents() {
  console.log('Fetching events...');

  const allLogs = [];
// define event objects for which to fetch logs   
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
// fetch current block number 
  const currentBlock = await client.getBlockNumber();
  console.log(`Current block number is ${currentBlock}`);
// determine the starting block for fetching blocks TODO: this has to be better lol. right now it uses the last event's block number and its not the last item on our receipt
  const eventName = eventObjects[eventObjects.length - 1].event; 
  let fromBlock = await getLastBlock(eventName);
  console.log(`event: ${eventName}`)
// if no block is found then we start at a hard coded ethereum block number
  if (fromBlock === null) {
    fromBlock = BigInt(3570818); // Replace with your hardcoded block number
  }
// fetch logs in chunks of 10k blocks. you can adjust as needed. TODO: possibly add option to go from last checked block to current block and retreive everything in one chunk
  while (fromBlock <= currentBlock) {
    console.log("From Block: ", fromBlock); // Debug line
    let toBlock: bigint = fromBlock + BigInt(10000) > currentBlock ? currentBlock : fromBlock + BigInt(10000);
  
    const logs = await fetchLogs(fromBlock, toBlock, eventObjects);
    if (logs.length > 0) {
      allLogs.push(...logs);
    }
  
    fromBlock = toBlock + BigInt(1);
  }
// if no log found, return empty json object
  if (allLogs.length === 0) {
    console.log('No logs to return.');
    return '{}';
  }
// converts json to string 
  const logsJson = JSON.stringify(allLogs, replacer, 2);
  console.log('Returning logs...');
  
// upload all logs at once
  const response = await uploadLogs(allLogs, eventObjects[0].event);
  
  return { logsJson, eventName: eventObjects[0].event };
}