import Bundlr from '@bundlr-network/client';
import * as fs from 'fs';
import 'dotenv/config';
import { getEvents } from './fetchEvents';
import { createBundlrTags, getLastBlock } from './bundlrActions';

async function main() {
  // Set up a reference to a bundlr object
  const bundlr = new Bundlr(
    'http://devnet.bundlr.network',
    'ethereum',
    process.env.PRIVATE_KEY,
    {
      // Required to provide an RPC URL when using the dev net
      providerUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_RPC_URL}`,
    }
  );

  console.log('Connected wallet address:', bundlr.address);

  // BALANCE CHECKS
  const atomicBalance = await bundlr.getLoadedBalance();
  const convertedBalance = bundlr.utils.fromAtomic(atomicBalance).toString();

  console.log('Account balance:', convertedBalance);

  const result = await getEvents();

  if (typeof result === 'string') {
    console.log('No new logs to upload.');
    return;
  }

  console.log('Starting to fetch press creation events...');

  // start parse
  
// Parse logsJson into an array of log objects
const logs = JSON.parse(result.logsJson);

// Check if logs array is not empty
if (logs.length > 0) {
  // Get the last log from the array
  const lastLog = logs[logs.length - 1];

  // Extract the responseId and blockNumber properties
  const blockNumber = lastLog.blockNumber;

  // Assign the blockNumber to fromBlock for the next execution
  let fromBlock = BigInt(blockNumber) + BigInt(1);

  console.log('Next fromBlock:', fromBlock);
} else {
  console.log('No logs were fetched.');
}
}
main(); 