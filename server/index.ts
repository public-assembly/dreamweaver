
import Bundlr from '@bundlr-network/client';
import * as fs from 'fs';
import 'dotenv/config';
import { getEvents} from './fetchEvents';

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

  const atomicBalance = await bundlr.getLoadedBalance();

  const convertedBalance = bundlr.utils.fromAtomic(atomicBalance).toString();

  console.log('Account balance:', convertedBalance);

  const logsJson = await getEvents();

  // If there are no new logs, don't upload anything
  if (logsJson === '{}') {
    console.log('No new logs to upload.');
    return;
  }

  // LAZY FUNDING
  // Calculate the size of the data to be uploaded
  const size = Buffer.byteLength(logsJson, 'utf8');

  const tags = [
    { name: 'Content-Type', value: 'application/json' },
    { name: 'Press Events', value: 'Create721Press' },
  ];
  
  const response = await bundlr.upload(logsJson, { tags });

  console.log(`Transaction hash ==> https://arweave.net/${response.id}`);

  const pathToData = `https://arweave.net/${response.id}`;

  return pathToData;
}

console.log('Starting to fetch press creation events...');
main();