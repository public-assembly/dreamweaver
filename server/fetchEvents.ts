import { client } from './viem';
import type { Hex } from 'viem';
import { getLastCheckedBlock, updateLastCheckedBlock } from './lastBlockCheck';
import Bundlr from '@bundlr-network/client';
import { ERC721PressFactoryAbi } from './abi';
import { SEPOLIA_ADDRESSES } from './contractAddresses/addresses';

// Constants
const ABI = ERC721PressFactoryAbi;
const ADDRESS = SEPOLIA_ADDRESSES.ERC721.ERC721_PRESS_FACTORY_PROXY as Hex;
const EVENT_NAME = 'Create721Press';

// Custom replacer function to handle BigInt serialization
const replacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

async function fetchLogs(fromBlock: bigint, toBlock: bigint) {
  const filter = await client.createContractEventFilter({
    abi: ABI,
    address: ADDRESS,
    eventName: EVENT_NAME,
    fromBlock: BigInt(fromBlock),
    toBlock: BigInt(toBlock),
  });

  console.log(`Filter created for blocks ${fromBlock} to ${toBlock}, getting logs...`);

  // Return a list of event logs since the filter was created
  const logs = await client.getFilterLogs({ filter });
  return logs;
}

async function uploadLog(log: any) {
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
    { name: 'Press Events', value: EVENT_NAME },
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
    const logs = await fetchLogs(fromBlock, toBlock);

    if (logs.length > 0) {
      console.log(`New logs found`);

      for (const log of logs) {
        await uploadLog(log); // Upload each log immediately after it is fetched
        allLogs.push(log);
      }
    } else {
      console.log('No new logs received');
    }

    // Update the last checked block number to the end of the current block range
    // console.log(`Updating last checked block number to ${toBlock}`);
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


//increment TEST 

// import { client } from './viem';
// import type { Hex } from 'viem';
// import { ERC721PressFactoryAbi } from './abi';
// import { SEPOLIA_ADDRESSES } from './contractAddresses/addresses';
// import { getLastCheckedBlock, updateLastCheckedBlock } from './lastBlockCheck'
// export async function getPressCreationEvents() {
//   console.log('Fetching press creation events...');

//   // Fetch the current block number
//   const currentBlock = await client.getBlockNumber();
//   console.log(`Current block number is ${currentBlock}`);

//   // Create a filter to retrieve event logs
//   let fromBlock = await getLastCheckedBlock();
//   let toBlock = fromBlock + BigInt(10); // Define the end of the block range for the first batch

//   // Declare an array to store all logs
//   const allLogs = [];

//   for (let i = fromBlock; i < toBlock; i++) {
//     // Create the filter for each block
//     const filter = await client.createContractEventFilter({
//       abi: ERC721PressFactoryAbi,
//       address: SEPOLIA_ADDRESSES.ERC721.ERC721_PRESS_FACTORY_PROXY as Hex,
//       eventName: 'Create721Press',
//       fromBlock: BigInt(i), // Start of the block range
//       toBlock: BigInt(i) + BigInt(1), // End of the block range
//     });

//     console.log(`Filter created for block ${i}, getting logs...`);

//     // Return a list of event logs since the filter was created
//     const logs = await client.getFilterLogs({ filter });

//     // Push the logs from this batch into the allLogs array
//     allLogs.push(...logs);

//     if (logs.length > 0) {
//       console.log(`New logs found`);
//     } else {
//       console.log('No new logs received');
//     }

//     // Update the last checked block number to the end of the current block range
//     console.log(`Updating last checked block number to ${i}`);
//     await updateLastCheckedBlock(i);
//   }

//   // If no new logs were found, return without uploading anything
//   if (allLogs.length === 0) {
//     console.log('No logs to return.');
//     return '{}';
//   }

//   const replacer = (key: string, value: bigint) =>
//     typeof value === 'bigint' ? value.toString() : value;

//   const logsJson = JSON.stringify(allLogs, replacer, 2);
//   console.log('Returning logs...');
//   return logsJson;
// }

// console.log('Starting to fetch press creation events...');
// getPressCreationEvents();
