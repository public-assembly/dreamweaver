import { client } from './viem';
import type { Hex } from 'viem';
import { getLastCheckedBlock, updateLastCheckedBlock } from './lastBlockCheck';
import Bundlr from '@bundlr-network/client';
import { ERC721PressFactoryAbi, CurationDatabaseV1Abi } from './abi';
import { SEPOLIA_ADDRESSES } from './contractAddresses/addresses';

// Constants
const ERC721PFABI = ERC721PressFactoryAbi;
const ERC721_PRESS_FACTORY_ADDRESS = SEPOLIA_ADDRESSES.ERC721.ERC721_PRESS_FACTORY_PROXY as Hex;
const CREATE_PRESS_EVENT = 'Create721Press';
const CURATION_DATABASE_ADDRESS = SEPOLIA_ADDRESSES.ERC721.CURATION_DATABASE_V1 as Hex; 
const CURATION_V1_ABI = CurationDatabaseV1Abi; 
const STORE_DATA_EVENT = 'DataStored';
const RENDER_UPDATED_EVENT = 'RendererUpdated';
const LOGIC_UPDATED_EVENT = 'LogicUpdated';
const PRESS_INITIALIZED_EVENT = 'PressInitialized';

// Custom replacer function to handle BigInt serialization
const replacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

async function fetchLogs(fromBlock: bigint, toBlock: bigint, eventNames: string[], abi: any, addresses: Hex[]) {
  const filters = await Promise.all(
    addresses.map((address, index) => client.createContractEventFilter({
      abi: abi[index],
      address,
      eventName: eventNames[index],
      fromBlock: BigInt(fromBlock),
      toBlock: BigInt(toBlock),
    }))
  );

  console.log(`Filter created for blocks ${fromBlock} to ${toBlock}, getting logs...`);

  // Return a list of event logs since the filter was created
  const logs = await Promise.all(
    filters.map((filter, index) => client.getFilterLogs({ filter: filter as any }).then(logs => logs.map(log => ({ ...log, eventName: eventNames[index] }))))
  );

  return logs.flat();
}



async function uploadLog(log: any, eventName: string) {
  const bundlr = new Bundlr(
    'http://devnet.bundlr.network',
    'ethereum',
    process.env.PRIVATE_KEY,
    {
      providerUrl: 'https://eth-sepolia.g.alchemy.com/v2/ISdh17Pa5NSsI-DNVufOeaGhwW8nF8Bk',
    }
  );

  const tags = [
    { name: 'Content-Type', value: 'application/json' },
    { name: 'Press Events', value: eventName },
  ];

  const response = await bundlr.upload(JSON.stringify(log, replacer, 2), { tags });

  console.log(`Uploaded log: https://arweave.net/${response.id}`);
}

export async function getPressCreationEvents() {
  console.log('Fetching press creation events...');

  // Fetch the current block number
  const currentBlock = await client.getBlockNumber();
  console.log(`Current block number is ${currentBlock}`);

  // Get the last checked block number
  let fromBlock = await getLastCheckedBlock();

  // Declare an array to store all logs
  const allLogs = [];

  while (fromBlock <= currentBlock) {
    const toBlock = fromBlock + BigInt(1); // Define the end of the block range

    // Fetch logs
    const logs = await fetchLogs(fromBlock, toBlock, [CREATE_PRESS_EVENT, STORE_DATA_EVENT, RENDER_UPDATED_EVENT, LOGIC_UPDATED_EVENT, PRESS_INITIALIZED_EVENT], [ERC721PFABI, CURATION_V1_ABI, CURATION_V1_ABI, CURATION_V1_ABI, CURATION_V1_ABI], [ERC721_PRESS_FACTORY_ADDRESS, CURATION_DATABASE_ADDRESS, CURATION_DATABASE_ADDRESS, CURATION_DATABASE_ADDRESS, CURATION_DATABASE_ADDRESS]);

    if (logs.length > 0) {
      console.log(`New logs found`);

      for (const log of logs) {
        await uploadLog(log, log.eventName); // Upload each log immediately after it is fetched
        allLogs.push(log);
      }
    } else {
      console.log('No new logs received');
    }

    // Update the last checked block number to the end of the current block range
    console.log(`Updating last checked block number to ${toBlock}`);
    await updateLastCheckedBlock(toBlock);

    // Update the block range for the next batch
    fromBlock = toBlock + BigInt(1);
  }

  // If no new logs were found, return without uploading anything
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
