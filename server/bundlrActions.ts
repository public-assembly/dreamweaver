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
const createBundlrTags = (eventName: string) => [
  { name: 'Content-Type', value: 'application/json' },
  { name: 'Press Events', value: eventName },
];

// // Uploads a single log to Arweave
// export async function uploadLog(log: Log, eventName: string) {
//   const tags = createBundlrTags(eventName);

//   const response = await bundlr.upload(JSON.stringify(log, replacer, 2), {
//     tags,
//   });

//   console.log(`Uploaded log: https://arweave.net/${response.id}`);
//   return log;
// }

// // Uploads an array of logs to Arweave
// export async function uploadLogs(logs: Log[], eventName: string) {
//   const tags = createBundlrTags(eventName);

//   const response = await bundlr.upload(JSON.stringify(logs, replacer, 2), {
//     tags,
//   });

//   console.log(`Uploaded logs: https://arweave.net/${response.id}`);
//   return logs;
// }

// export async function uploadLogsGrouped(logs: any[], eventName: string) {
//     const tags = createBundlrTags(eventName);
  
//     const response = await bundlr.upload(JSON.stringify(logs, replacer, 2), { tags });
  
//     console.log(`Uploaded logs: https://arweave.net/${response.id}`);
//     return logs;
//   }

// Uploads an array of logs to Arweave
export async function uploadLogs(logs: Log[], eventName: string) {
    const tags = createBundlrTags(eventName);
  
    const response = await bundlr.upload(JSON.stringify(logs, replacer, 2), {
      tags,
    });
  
    console.log(`Uploaded logs: https://arweave.net/${response.id}`);
    return response;
  }