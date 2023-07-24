import { getEvents } from './fetch';
import { bundlr } from './bundlr';
import { PrismaClient } from '@prisma/client';
import { Transactions, APLogs, Node } from './interfaces/transactionInterfaces';
import { apolloClient } from './apolloClient';
import { NEW_TRANSACTIONS } from './gql';
import { replacer } from './utils';

const prisma = new PrismaClient();

async function main() {

  async function checkBalance() {
  console.log('Connected wallet address:', bundlr.address);
  const atomicBalance = await bundlr.getLoadedBalance();
  const convertedBalance = bundlr.utils.fromAtomic(atomicBalance).toString();
  console.log('Account balance:', convertedBalance);
  }

await checkBalance()

  console.log('Starting to fetch press creation events...');

const result = await getEvents();
const { cleanedLogs } = result

async function getFromBlock() {

  if (typeof result === 'string') {
    console.log('No new logs to upload.');
    return;
  }
  

  const logs = JSON.parse(result.logsJson);
  const lastLog = logs[logs.length - 1];
  const blockNumber = lastLog.blockNumber;
  console.log('last blocknumber:', blockNumber)
  // const blockNumber = BigInt(3839849)
  let fromBlock = BigInt(blockNumber) + BigInt(1);

  console.log('Next fromBlock:', fromBlock);
}

await getFromBlock()

  const { data } = await apolloClient.query({ query: NEW_TRANSACTIONS });
  const processedTransactions = processTransactions(data.transactions);

  // console.log(`testing: ${JSON.stringify(data, replacer, 2)}`)

  for (const transaction of processedTransactions) {
    if (transaction) {
      console.log(`transaction: ${JSON.stringify(transaction, replacer, 2)}`);
      await prisma.transaction.upsert({
        where: { id: transaction.id },
        create: {
            id: transaction.id,
            address: transaction.address,
            eventType: transaction.eventType,
            tags: transaction.tags
        },
        update: {
            id: transaction.id,
            address: transaction.address,
            eventType: transaction.eventType,
            tags: transaction.tags
          },
      }).catch(e => console.error("Error upserting transaction:", e.message));
    }

  }



  // console.log(`cleaned fucking logs: ${JSON.stringify(cleanedLogs, replacer, 2)}`)
  await processCleanedLogs(data.transactions, cleanedLogs);
}
function processTransactions(transactions: Transactions) {
  const eventTypes = [
    'Create721Press',
    'DataStored',
    'DataRemoved',
    'DataOverwritten',
    'LogicUpdated',
    'PressInitialized',
    'RendererUpdated',
  ];
  
  return transactions.edges.map((edge) => {
    const eventTag = edge.node.tags.find((tag) => tag.name === 'Press Events');
    if (!eventTag || !eventTypes.includes(eventTag.value)) {
      return null;
    }
    return shapeData(edge.node);
  });
}

function shapeData(node: Node) {
  const tags = node.tags.reduce((acc, tag) => {
    acc[tag.name] = tag.value;
    return acc;
  }, {} as Record<string, string>);

  return {
    id: node.id,
    address: node.address,
    eventType: tags['Press Events'],
    tags,
  };
}

export async function getTransactions() {
    const transactions = await prisma.transaction.findMany();
    return transactions;
  }
  

export async function processCleanedLogs(transactions: Transactions, cleanedLogs: APLogs[]) {
  // console.log('processCleanedLogs function called');
  //   console.log('Processing cleaned logs...'); 
    // console.log('transactions.edges:', transactions.edges);
    console.log('cleanedLogs:', `${JSON.stringify(cleanedLogs,replacer,2)}`);
    for (const edge of transactions.edges) {
        for (const log of cleanedLogs) {
          console.log('log:', log);
            if (!log.args) {
                console.log(`Skipping log due to missing args: ${JSON.stringify(log)}`);
                continue;
            }
            console.log(`Processing log with event name: ${log.eventName}`); 
            switch (log.eventName) {
                case 'Create721Press':
                  console.log(log.args);
                  console.log(log.eventName)
                    if (edge.node.id && log.args.newPress && log.args.initialOwner && log.args.initialLogic && log.args.creator && log.args.initialRenderer && typeof log.args.soulbound !== 'undefined') {
                        const createPressEvent = {
                            where: { id: edge.node.id },
                            create: {
                                id: edge.node.id,
                                newPress: log.args.newPress,
                                initialOwner: log.args.initialOwner,
                                initialLogic: log.args.initialLogic,
                                creator: log.args.creator,
                                initialRenderer: log.args.initialRenderer,
                                soulbound: log.args.soulbound,
                            },
                            update: {
                                id: edge.node.id,
                              },
                        };
                        try {
                          await prisma.create721Press.upsert(createPressEvent);
                        } catch (e) {
                          if (e instanceof Error) {
                            console.error("Error upserting Create721Press event:", e.message);
                          } else {
                            console.error("An error occurred while upserting Create721Press event");
                    } }}
                    break;
                case 'RendererUpdated':
                  console.log(log.args);
                  console.log(log.eventName)
                    if (edge.node.id && log.args.targetPress && log.args.renderer) {
                        const rendererEvent = {
                            where: { id: edge.node.id },
                            create: {
                                id: edge.node.id,
                                targetPress: log.args.targetPress,
                                renderer: log.args.renderer,
                            },
                            update: {
                                id: edge.node.id,
                              },
                        }; 
                        try {
                          await prisma.rendererUpdated.upsert(rendererEvent);
                        } catch (e) {
                          if (e instanceof Error) {
                            console.error("Error upserting Create721Press event:", e.message);
                          } else {
                            console.error("An error occurred while upserting Create721Press event");
                    } }}
                    break;
                case 'DataStored':
                  console.log(log.args);
                  console.log(log.eventName)
                    if (edge.node.id && log.args.targetPress && log.args.storeCaller && log.args.tokenId && log.args.pointer) {
                        const dataStoredEvent = {
                            where: { id: edge.node.id },
                            create: {
                                id: edge.node.id,
                                targetPress: log.args.targetPress,
                                storeCaller: log.args.storeCaller,
                                tokenId: log.args.tokenId,
                                pointer: log.args.pointer
                            },
                            update: {
                                id: edge.node.id,
                              },
                        }; 
                        try {
                          await prisma.dataStored.upsert(dataStoredEvent);
                        } catch (e) {
                          if (e instanceof Error) {
                            console.error("Error upserting Create721Press event:", e.message);
                          } else {
                            console.error("An error occurred while upserting Create721Press event");
                    } }}
                    break;
                case 'LogicUpdated':
                  console.log(log.args);
                  console.log(log.eventName)
                    if (edge.node.id && log.args.targetPress && log.args.logic) {
                        const logicEvent = {
                            where: { id: edge.node.id },
                            create: {
                                id: edge.node.id,
                                targetPress: log.args.targetPress,
                                logic: log.args.logic,
                            },
                            update: {
                                id: edge.node.id,
                              },
                        }; 
                        try {
                          await prisma.logicUpdated.upsert(logicEvent);
                        } catch (e) {
                          if (e instanceof Error) {
                            console.error("Error upserting Create721Press event:", e.message);
                          } else {
                            console.error("An error occurred while upserting Create721Press event");
                    } }}
                    break;
                case 'PressInitialized':
                  console.log(log.args);
                  console.log(log.eventName)
                    if (edge.node.id && log.args.targetPress && log.args.sender) {
                        const pressEvent =  {
                            where: { id: edge.node.id },
                            create: {
                                id: edge.node.id,
                                targetPress: log.args.targetPress,
                                sender: log.args.sender,
                            },
                            update: {
                                id: edge.node.id,
                              },
                        };
                        try {
                          await prisma.pressInitialized.upsert(pressEvent);
                        } catch (e) {
                          if (e instanceof Error) {
                            console.error("Error upserting Create721Press event:", e.message);
                          } else {
                            console.error("An error occurred while upserting Create721Press event");
                    } }}
                    break;
                default:
                    console.log(`Unknown event type: ${log.eventName}`);
            }
        }
    }
}


main()
  .catch((e) => {
    console.error('Error running main: ', e);
    throw e;
  })
  .finally(async () => {
    console.log("Finished all Prisma operations, disconnecting...");
    await prisma.$disconnect();
  });