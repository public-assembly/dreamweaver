  import { getLastBlock, uploadLogs } from '../bundlr/bundlrActions';
  import { ERC721PressFactoryAbi, CurationDatabaseV1Abi,  } from '../abi';
  import { sepolia, events, optimism_goerli } from '../constants';
  import { EventObject } from '../types';
  import { replacer } from '../utils';
  import { viemClient } from '../viem/client';
  import { fetchLogs } from '.';
  import { Transactions, APLogs } from '../interfaces/transactionInterfaces';
  import { processCleanedLogs } from '../processAndUpload';
  import { getTransactions, transformTags } from '../prisma';
  import { AP721DatabaseV1Abi } from '../abi/AP721DatabaseV1Abi';
  
  function convertArgs(args: object): APLogs['args'] | undefined {
    const convertedArgs: Partial<APLogs['args']> = {};
  
    for (const key in args) {
      if (Object.prototype.hasOwnProperty.call(args, key)) {
        (convertedArgs as Record<string, any>)[key] = (args as Record<string, any>)[key];
      }
    }
  
    return convertedArgs as APLogs['args']; // Cast to APLogs['args'] to assert the final type
  }
  
  function convertLog(log: /*typeof logs[0]*/ any): APLogs { 
    return {
      ...log,
      args: convertArgs(log.args as object), // Cast args to object
    };
  }
  export async function getEvents() {
    console.log('Fetching events...');
  
    const allLogs = [];
  
    // SEPOLIA
    // define event objects for which to fetch logs
    // const eventObjects: EventObject[] = [
    //   {
    //     event: events.CREATE_PRESS,
    //     abi: ERC721PressFactoryAbi,
    //     address: sepolia.ERC721_PRESS_FACTORY,
    //   },
    //   {
    //     event: events.DATA_STORED,
    //     abi: CurationDatabaseV1Abi,
    //     address: sepolia.CURATION_DATABASE_V1,
    //   },
    //   {
    //     event: events.DATA_REMOVED,
    //     abi: CurationDatabaseV1Abi,
    //     address: sepolia.CURATION_DATABASE_V1,
    //   },
    //   {
    //     event: events.DATA_OVERWRITTEN,
    //     abi: CurationDatabaseV1Abi,
    //     address: sepolia.CURATION_DATABASE_V1,
    //   },
    //   {
    //     event: events.LOGIC_UPDATED,
    //     abi: CurationDatabaseV1Abi,
    //     address: sepolia.CURATION_DATABASE_V1,
    //   },
    //   {
    //     event: events.PRESS_INITIALIZED,
    //     abi: CurationDatabaseV1Abi,
    //     address: sepolia.CURATION_DATABASE_V1,
    //   },
    //   {
    //     event: events.RENDERER_UPDATED,
    //     abi: CurationDatabaseV1Abi,
    //     address: sepolia.CURATION_DATABASE_V1,
    //   },
    // ];

    // OPTIMISM GOERLI

    const eventObjects: EventObject[] = [ 
    {
        event: events.DATA_OVERWRITTEN,
        abi: AP721DatabaseV1Abi ,
        address: optimism_goerli.AP721DATABASEV1,
      },
      {       
        event: events.DATA_REMOVED,
        abi: AP721DatabaseV1Abi,
        address: optimism_goerli.AP721DATABASEV1,

      },
      {       
        event: events.DATA_STORED,
        abi: AP721DatabaseV1Abi,
        address: optimism_goerli.AP721DATABASEV1,

      },
      {       
        event: events.LOGIC_UPDATED,
        abi: AP721DatabaseV1Abi,
        address: optimism_goerli.AP721DATABASEV1,

      },
      {       
        event: events.RENDERER_UPDATED,
        abi: AP721DatabaseV1Abi,
        address: optimism_goerli.AP721DATABASEV1,

      },
      {       
        event: events.SETUP_AP721,
        abi: AP721DatabaseV1Abi,
        address: optimism_goerli.AP721DATABASEV1,

      },
    ]
  
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
  
    /**
     * fetch logs in chunks of 10,000 blocks, adjust as needed
     * if you want to process all blocks in one go, you can move fetchLogs outside the loop and remove loop
     * however, this may take a long time
     */
  
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
  
    const cleanedLogs = allLogs.map(convertLog); // Use convertLog instead of cleanLog

  
      // if no log found, return empty json object
      if (cleanedLogs.length === 0) {
        console.log('No logs to return.');
        return {
          cleanedLogs: [],
          logsJson: '{}',
          eventName: eventObjects[0].event,
        };
      }
  
      // converts json to string
      const logsJson = JSON.stringify(cleanedLogs, replacer, 2); // Changed allLogs to cleanedLogs
      console.log('Returning logs...');
  
      const response = await uploadLogs(cleanedLogs, eventObjects[0].event); // Changed allLogs to cleanedLogs
  
      // how we target log.args
      // console.log(`cleaned logs args and event names: ${JSON.stringify(cleanedLogs.map(log => ({args: log.args, eventName: log.eventName})), replacer, 2)}`)
      const transactionsArray = await getTransactions();
  
      const transactions: Transactions = {
        edges: transactionsArray.map((transaction) => ({
          node: {
            ...transaction,
            tags: transaction.tags ? transformTags(transaction.tags) : [], // Check if transaction.tags is null
          },
        })),
      };
  
      await processCleanedLogs(cleanedLogs);
  
      return { logsJson, cleanedLogs, eventName: eventObjects[0].event };
    }
  
  
    
  
