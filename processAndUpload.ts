import { getEvents } from './fetch';
import { getBalance } from './bundlr/getBalance';
import { getTransactions } from './prisma/getTransactions';
import { prisma } from './prisma/prismaClient';
import { Transactions, APLogs, Node } from './interfaces/transactionInterfaces';
import { apolloClient } from './apollo/apolloClient';
import { NEW_TRANSACTIONS_QUERY } from './gql';
import { replacer } from './utils';
import env from './services/env';

async function main() {
  await getBalance();
  await getTransactions();

  console.log('Starting to fetch press creation events...');

  const result = await getEvents();
  const { cleanedLogs } = result;

  async function getFromBlock() {
    if (typeof result === 'string') {
      console.log('No new logs to upload.');
      return;
    }

    const logs = JSON.parse(result.logsJson);
    const lastLog = logs[logs.length - 1];
    const blockNumber = lastLog.blockNumber;
    // const blockNumber = BigInt(3833867);
    console.log('last blocknumber:', blockNumber);
    let fromBlock = BigInt(blockNumber) + BigInt(1);

    console.log('Next fromBlock:', fromBlock);
  }

  await getFromBlock();

  const { data } = await apolloClient.query({
    query: NEW_TRANSACTIONS_QUERY,
    variables: { owner: env.OWNER },
  });
  const processedTransactions = processTransactions(data.transactions);

  for (const transaction of processedTransactions) {
    if (transaction) {
      console.log(`transaction: ${JSON.stringify(transaction, replacer, 2)}`);
      await prisma.transaction
        .create({
          data: {
            id: transaction.id,
            address: transaction.address,
            eventType: transaction.eventType,
            tags: transaction.tags,
          }
        })
        .catch((e: Error) => console.error('Error upserting transaction:', e.message));
    }
  }

  await processCleanedLogs(cleanedLogs);
}

//sepolia
// function processTransactions(transactions: Transactions) {
//   const eventTypes = [
//     'Create721Press',
//     'DataStored',
//     'DataRemoved',
//     'DataOverwritten',
//     'LogicUpdated',
//     'PressInitialized',
//     'RendererUpdated',
//   ];

// optimism goerli 
function processTransactions(transactions: Transactions) {
  const eventTypes = [
    'SetupAP721',
    'DataStored',
    'DataOverwritten',
    'DataRemoved',
    'LogicUpdated',
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

// sepolia
// export async function processCleanedLogs(
//   cleanedLogs: APLogs[]
// ) {
//   // console.log('processCleanedLogs function called');
//   //   console.log('Processing cleaned logs...');
//   // console.log('transactions.edges:', transactions.edges);
//   const eventArgs = cleanedLogs.map(log => ({ args: log.args, eventName: log.eventName}));
//   console.log('cleanedLogs:', `${JSON.stringify(cleanedLogs, replacer, 2)}`);
//     for (const log of cleanedLogs) {
//       console.log('log:', log);
//       if (!log.args) {
//         console.log(`Skipping log due to missing args: ${JSON.stringify(log)}`);
//         continue;
//       }
//       console.log(`Processing log with event name: ${log.eventName}`);
//       switch (log.eventName) {
//         case 'Create721Press':
//           console.log(log.args);
//           console.log(log.eventName);
          // if (
          //   log.args.newPress &&
          //   log.args.initialOwner &&
          //   log.args.initialLogic &&
          //   log.args.creator &&
          //   log.args.initialRenderer &&
          //   typeof log.args.soulbound !== 'undefined'
          // ) {
//             const createPressEvent = {

//               data: {
//                 newPress: log.args.newPress,
//                 initialOwner: log.args.initialOwner,
//                 initialLogic: log.args.initialLogic,
//                 creator: log.args.creator,
//                 initialRenderer: log.args.initialRenderer,
//                 soulbound: log.args.soulbound,
//               },

//             };
//             try {
//               await prisma.create721Press.create(createPressEvent);
//             } catch (e) {
//               if (e instanceof Error) {
//                 console.error(
//                   'Error upserting Create721Press event:',
//                   e.message
//                 );
//               } else {
//                 console.error(
//                   'An error occurred while upserting Create721Press event'
//                 );
//               }
//             }
//           }
//           break;
//         case 'RendererUpdated':
//           console.log(log.args);
//           console.log(log.eventName);
//           if ( log.args.targetPress && log.args.renderer) {
//             const rendererEvent = {

//               data: {
//                 targetPress: log.args.targetPress,
//                 renderer: log.args.renderer,
//               }
//             };
//             try {
//               await prisma.rendererUpdated.create(rendererEvent);
//             } catch (e) {
//               if (e instanceof Error) {
//                 console.error(
//                   'Error upserting Create721Press event:',
//                   e.message
//                 );
//               } else {
//                 console.error(
//                   'An error occurred while upserting Create721Press event'
//                 );
//               }
//             }
//           }
//           break;
//         case 'DataStored':
//           console.log(log.args);
//           console.log(log.eventName);
//           if (
//             log.args.targetPress &&
//             log.args.storeCaller &&
//             log.args.tokenId &&
//             log.args.pointer
//           ) {
//             const dataStoredEvent = {
//               data: {
//                 targetPress: log.args.targetPress,
//                 storeCaller: log.args.storeCaller,
//                 tokenId: log.args.tokenId,
//                 pointer: log.args.pointer,
//               }
//             };
//             try {
//               await prisma.dataStored.create(dataStoredEvent);
//             } catch (e) {
//               if (e instanceof Error) {
//                 console.error(
//                   'Error upserting Create721Press event:',
//                   e.message
//                 );
//               } else {
//                 console.error(
//                   'An error occurred while upserting Create721Press event'
//                 );
//               }
//             }
//           }
//           break;
//         case 'LogicUpdated':
//           console.log(log.args);
//           console.log(log.eventName);
//           if ( log.args.targetPress && log.args.logic) {
//             const logicEvent = {
//               data: {
//                 targetPress: log.args.targetPress,
//                 logic: log.args.logic,
//               }
//             };
//             try {
//               await prisma.logicUpdated.create(logicEvent);
//             } catch (e) {
//               if (e instanceof Error) {
//                 console.error(
//                   'Error upserting Create721Press event:',
//                   e.message
//                 );
//               } else {
//                 console.error(
//                   'An error occurred while upserting Create721Press event'
//                 );
//               }
//             }
//           }
//           break;
//         case 'PressInitialized':
//           console.log(log.args);
//           console.log(log.eventName);
//           if ( log.args.targetPress && log.args.sender) {
//             const pressEvent = {
//               data: {
//                 sender: log.args.sender,
//                 targetPress: log.args.targetPress,
//               }
//             };
//             try {
//               await prisma.pressInitialized.create(pressEvent);
//             } catch (e) {
//               if (e instanceof Error) {
//                 console.error(
//                   'Error upserting Create721Press event:',
//                   e.message
//                 );
//               } else {
//                 console.error(
//                   'An error occurred while upserting Create721Press event'
//                 );
//               }
//             }
//           }
//           break;
//         default:
//           console.log(`Unknown event type: ${log.eventName}`);
//       }
//     }
//   }

// optimism goerli
export async function processCleanedLogs(cleanedLogs: APLogs[]) {
  for (const log of cleanedLogs) {
    console.log('log:', log);
    if (!log.args) {
      console.log(`Skipping log due to missing args: ${JSON.stringify(log)}`);
      continue;
    }
    console.log(`Processing log with event name: ${log.eventName}`);
    try {
      switch (log.eventName) {
        case 'SetupAP721':
          if (
            log.args.ap721  &&
            log.args.sender &&
            log.args.initialOwner  &&
            log.args.logic  &&
            log.args.renderer &&
            log.args.factory !== undefined
          ) {
            await prisma.setupAP721.create({
              data: {
                ap721: log.args.ap721,
                sender: log.args.sender,
                initialOwner: log.args.initialOwner,
                logic: log.args.logic,
                renderer: log.args.renderer,
                factory: log.args.factory,
              },
            });
          }
          break;
        case 'DataStored':
          if (
            log.args.target &&
            log.args.sender  &&
            log.args.tokenId  &&
            log.args.pointer !== undefined
          ) {
            await prisma.dataStored.create({
              data: {
                target: log.args.target,
                sender: log.args.sender,
                tokenId: log.args.tokenId,
                pointer: log.args.pointer,
              },
            });
          }
          break;
        case 'DataOverwritten':
          if (
            log.args.target &&
            log.args.sender &&
            log.args.tokenId &&
            log.args.pointer !== undefined
          ) {
            await prisma.dataOverwritten.create({
              data: {
                target: log.args.target,
                sender: log.args.sender,
                tokenId: log.args.tokenId,
                pointer: log.args.pointer,
              },
            });
          }
          break;
        case 'DataRemoved':
          if (
            log.args.target !== undefined &&
            log.args.sender !== undefined &&
            log.args.tokenId !== undefined
          ) {
            await prisma.dataRemoved.create({
              data: {
                target: log.args.target,
                sender: log.args.sender,
                tokenId: log.args.tokenId,
              },
            });
          }
          break;
        case 'LogicUpdated':
          if (
            log.args.target !== undefined &&
            log.args.logic !== undefined
          ) {
            await prisma.logicUpdated.create({
              data: {
                target: log.args.target,
                logic: log.args.logic,
              },
            });
          }
          break;
        case 'RendererUpdated':
          if (
            log.args.target !== undefined &&
            log.args.renderer !== undefined
          ) {
            await prisma.rendererUpdated.create({
              data: {
                target: log.args.target,
                renderer: log.args.renderer,
              },
            });
          }
          break;
        default:
          console.log(`Unknown event type: ${log.eventName}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(`Error processing event ${log.eventName}:`, e.message);
      } else {
        console.error(`An error occurred while processing event ${log.eventName}`);
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
    console.log('Finished all Prisma operations, disconnecting...');
    await prisma.$disconnect();
  });