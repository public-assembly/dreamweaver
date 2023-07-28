import { replacer } from '../utils';
import { bundlr } from './bundlrInit';
import {  APLogs } from '../interfaces/transactionInterfaces';


// create metadata tags for Bundlr uploads that will help us identify our uploads later on
export const createBundlrTags = (logs: APLogs[]) => {
  const tags = [{ name: 'Content-Type', value: 'application/json' }];

  // Create a tag for each unique event name in the logs
  const uniqueEventNames = [...new Set(logs.map(log => log.eventName))];
  uniqueEventNames.forEach(eventName => {
    tags.push({ name: "Press Events - Optimism-Goerli v0.1", value: eventName });
  });

  return tags;
};

// upload logs as a stringified JSON

export async function uploadLogs(logs: APLogs[]) {
  const tags = createBundlrTags(logs);

  const response = await bundlr.upload(JSON.stringify(logs, replacer, 2), {
    tags,
  });

  console.log(`Uploaded logs: https://arweave.net/${response.id}`);

  return { response, cleanedLogs: logs };
}
