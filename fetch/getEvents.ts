import { getLastBlock, uploadLogs } from '../bundlr/bundlrActions';
import { ERC721PressFactoryAbi, CurationDatabaseV1Abi } from '../abi';
import { sepolia, events } from '../constants';
import { EventObject } from '../types';
import { replacer } from '../utils';
import { viemClient } from '../viem';
import { fetchLogs } from './fetchLogs'
import { APLogs, Transactions, Tag} from '../interfaces/transactionInterfaces';
import { processCleanedLogs } from '../processAndUpload';
import { getTransactions } from '../processAndUpload';
import { Prisma } from '@prisma/client';


function cleanLog(log: APLogs) {
  const { 
    address = '0x0', // Default value
    blockNumber = BigInt(0), 
    blockHash = '0x0', // Default value
    args = {}, 
    eventName,
    data = '0x0', // Default value
    logIndex = 0, // Default value
    transactionHash = '0x0', // Default value
    transactionIndex = 0, // Default value
    removed = false, // Default value
    topics = [], // Default value
  } = log;

  return {
    address,
    blockNumber,
    blockHash,
    args,
    eventName,
    data,
    logIndex,
    transactionHash,
    transactionIndex,
    removed,
    topics,
  };
}

// function to get all events
function transformTags(tags: Prisma.JsonValue): Tag[] {
  // Check if tags is an array
  if (Array.isArray(tags)) {
    // If tags is an array, map over it and transform each item into a Tag
    return tags.map(tag => {
      if (typeof tag === 'object' && tag !== null && 'name' in tag && 'value' in tag) {
        return {
          name: String(tag.name),
          value: String(tag.value),
        };
      } else {
        // If the tag is not an object with 'name' and 'value' fields, return a default Tag
        return { name: '', value: '' };
      }
    });
  } else {
    // If tags is not an array, return an empty array
    return [];
  }
}

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
    const currentBlock = await viemClient.getBlockNumber();
    console.log(`Current block number is ${currentBlock}`);
    // determine the starting block for fetching blocks
    const eventName = eventObjects[eventObjects.length - 1].event;
    let fromBlock = await getLastBlock(eventName);
    // if no block is found then we start at a hard coded ethereum block number
    if (fromBlock === null) {
      fromBlock = BigInt(3570818); // Replace with your hardcoded block number
    }
    
    // fetch logs in chunks of 10k blocks. you can adjust as needed. 
    // if you want to process all blocks in one go, you can move fetchLogs outside the loop and remove loop.
    // however, this may take a long time. 
  
    while (fromBlock <= currentBlock) {
      console.log('From Block: ', fromBlock); // Debug line
      let toBlock: bigint =
        fromBlock + BigInt(10000) > currentBlock
          ? currentBlock
          : fromBlock + BigInt(10000);
    
      const logs = await fetchLogs(fromBlock, toBlock, eventObjects);
      if (logs.length > 0) {
        allLogs.push(...logs);
      }
    
      fromBlock = toBlock + BigInt(1);
    }
    
    const cleanedLogs = allLogs.map(cleanLog); 
    
    // if no log found, return empty json object
    if (cleanedLogs.length === 0) {
      console.log('No logs to return.');
      return '{}';
    }
    
    // converts json to string
    const logsJson = JSON.stringify(cleanedLogs, replacer, 2); // Changed allLogs to cleanedLogs
    console.log('Returning logs...');
    
    const response = await uploadLogs(cleanedLogs, eventObjects[0].event); // Changed allLogs to cleanedLogs

    // how we target log.args
    // console.log(`cleaned logs args and event names: ${JSON.stringify(cleanedLogs.map(log => ({args: log.args, eventName: log.eventName})), replacer, 2)}`)
    const transactionsArray = await getTransactions();

    const transactions: Transactions = {
      edges: transactionsArray.map(transaction => ({
        node: {
          ...transaction,
          tags: transaction.tags ? transformTags(transaction.tags) : [],  // Check if transaction.tags is null
        },
      })),
    };

    await processCleanedLogs(transactions, cleanedLogs)

    return { logsJson, cleanedLogs, eventName: eventObjects[0].event };

  }