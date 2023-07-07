import { client } from './viem';
import type { Hex } from 'viem';
import { ERC721PressFactoryAbi } from './abi';
import { SEPOLIA_ADDRESSES } from './contractAddresses/addresses';
import { getLastCheckedBlock, updateLastCheckedBlock } from './lastBlockCheck'

export async function getPressCreationEvents() {
  console.log('Fetching press creation events...');

  // Fetch the current block number
  const currentBlock = await client.getBlockNumber();
  console.log(`Current block number is ${currentBlock}`);

  // Create a filter to retrieve event logs
  let fromBlock = await getLastCheckedBlock();
  let toBlock = fromBlock + BigInt(1); // Define the end of the block range for the first batch

  // Declare an array to store all logs
  const allLogs = [];

  while (fromBlock <= currentBlock) {
    const filter = await client.createContractEventFilter({
      abi: ERC721PressFactoryAbi,
      address: SEPOLIA_ADDRESSES.ERC721.ERC721_PRESS_FACTORY_PROXY as Hex,
      eventName: 'Create721Press',
      fromBlock: BigInt(fromBlock), // Start of the block range
      toBlock: BigInt(toBlock), // End of the block range
    });
    console.log(`Filter created for blocks ${fromBlock} to ${toBlock}, getting logs...`);
    // Return a list of event logs since the filter was created
    const logs = await client.getFilterLogs({ filter });

    // Push the logs from this batch into the allLogs array
    allLogs.push(...logs);

    if (logs.length > 0) {
      console.log(`New logs found`);
    } else {
      console.log('No new logs received');
    }

    // Update the last checked block number to the end of the current block range
    console.log(`Updating last checked block number to ${toBlock}`);
    await updateLastCheckedBlock(toBlock);

    // Update the block range for the next batch
    fromBlock = toBlock + BigInt(1);
    toBlock = toBlock + BigInt(1);
  }

  // If no new logs were found, return without uploading anything
  if (allLogs.length === 0) {
    console.log('No logs to return.');
    return '{}';
  }

  const replacer = (key: string, value: bigint) =>
    typeof value === 'bigint' ? value.toString() : value;

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
