import { client } from './viem';
import type { Hex, Abi } from 'viem';
import { getLastCheckedBlock, updateLastCheckedBlock } from './lastBlockCheck';
import { ERC721PressFactoryAbi, CurationDatabaseV1Abi } from './abi';
import { sepolia, events } from './constants';
import { replacer } from './utils';


type EventObject = {
  event: string;
  abi: Abi;
  address: Hex
}

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

  const currentBlock = await client.getBlockNumber();
  console.log(`Current block number is ${currentBlock}`);

  let fromBlock = await getLastCheckedBlock();
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

  while (fromBlock <= currentBlock) {
    const toBlock = fromBlock + BigInt(100) > currentBlock ? currentBlock : fromBlock + BigInt(100);

    const logs = await fetchLogs(fromBlock, toBlock, eventObjects);
    allLogs.push(...logs);

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
  // return logsJson;
  return { logsJson, eventName: eventObjects[0].event };
}

console.log('Starting to fetch events...');

getEvents();
