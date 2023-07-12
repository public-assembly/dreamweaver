import Bundlr from '@bundlr-network/client';
import { replacer } from './utils';
import { Log } from 'viem';

// Initialize Bundlr
export const bundlr = new Bundlr(
  'http://devnet.bundlr.network',
  'ethereum',
  process.env.PRIVATE_KEY,
  {
    providerUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_RPC_URL}`,
  }
);

// Metadata for Bundlr uploads
export const createBundlrTags = (eventName: string) => [
  { name: 'Content-Type', value: 'application/json' },
  { name: 'Press Events', value: eventName },
];

// Uploads an array of logs to Arweave. 
export async function uploadLogs(logs: Log[], eventName: string) {
    const tags = createBundlrTags(eventName);
  
    const response = await bundlr.upload(JSON.stringify(logs, replacer, 2), {
      tags,
    });
  
    console.log(`Uploaded logs: https://arweave.net/${response.id}`);
    return response;
  }