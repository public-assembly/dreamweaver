import { getEvents } from './fetch';
import { bundlr } from './bundlr';
import { PrismaClient } from '@prisma/client';
import { Transactions, APLogs, Node } from './interfaces/transactionInterfaces';
import { apolloClient } from './apolloClient';
import { NEW_TRANSACTIONS } from './gql';

const prisma = new PrismaClient();

async function main() {

  async function checkBalance() {
  console.log('Connected wallet address:', bundlr.address);
  const atomicBalance = await bundlr.getLoadedBalance();
  const convertedBalance = bundlr.utils.fromAtomic(atomicBalance).toString();
  console.log('Account balance:', convertedBalance);
  }

checkBalance()

  console.log('Starting to fetch press creation events...');

async function getFromBlock() {
  const result = await getEvents();

  if (typeof result === 'string') {
    console.log('No new logs to upload.');
    return;
  }

  const logs = JSON.parse(result.logsJson);
  const lastLog = logs[logs.length - 1];
  const blockNumber = lastLog.blockNumber;
  let fromBlock = BigInt(blockNumber) + BigInt(1);

  console.log('Next fromBlock:', fromBlock);
}

getFromBlock()

  const { data } = await apolloClient.query({ query: NEW_TRANSACTIONS });
  const processedTransactions = processTransactions(data.transactions);

  for (const transaction of processedTransactions) {
    if (transaction) {
      await prisma.transaction.upsert({
        where: { id: data.id },
        create: {
            id: data.id,
            address: data.address,
            eventType: data.eventName,
            tags: data.tags
        },
        update: {
            id: data.id,
            address: data.address,
            eventType: data.eventName,
            tags: data.tags
          },
      });
    }

  }

  const cleanedLogs: APLogs[] = []; 
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
    console.log('Processing cleaned logs...'); 
    for (const edge of transactions.edges) {
        for (const log of cleanedLogs) {
            if (!log.args) {
                console.log(`Skipping log due to missing args: ${JSON.stringify(log)}`);
                continue;
            }
            switch (log.eventName) {
                case 'Create721Press':
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
                        await prisma.create721Press.upsert(createPressEvent);
                    } else {
                        console.log('Skipping Create721Press event due to missing args');
                    }
                    break;
                case 'RendererUpdated':
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
                        await prisma.rendererUpdated.upsert(rendererEvent);
                    } else {
                        console.log('Skipping RendererUpdated event due to missing args');
                    }
                    break;
                case 'DataStored':
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
                        await prisma.dataStored.upsert(dataStoredEvent);
                    } else {
                        console.log('Skipping DataStored event due to missing args');
                    }
                    break;
                case 'LogicUpdated':
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
                        await prisma.logicUpdated.upsert(logicEvent);
                    } else {
                        console.log('Skipping LogicUpdated event due to missing args');
                    }
                    break;
                case 'PressInitialized':
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
                        await prisma.pressInitialized.upsert(pressEvent);
                    } else {
                        console.log('Skipping PressInitialized event due to missing args');
                    }
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
    await prisma.$disconnect();
  });
