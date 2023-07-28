import { getEvents } from './fetch/getEvents';
import { getBalance } from './bundlr/utils/getBalance';
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

  const { data } = await apolloClient.query({
    query: NEW_TRANSACTIONS_QUERY,
    variables: { owner: env.OWNER },
  });
  const processedTransactions = processTransactions(data.transactions);

  // for (const transaction of processedTransactions) {
  //   if (transaction) {
  //     console.log(`transaction: ${JSON.stringify(transaction, replacer, 2)}`);
  //     await prisma.transaction
  //       .create({
  //         data: {
  //           id: transaction.id,
  //           address: transaction.address,
  //           eventType: transaction.eventType,
  //           tags: transaction.tags,
  //         }
  //       })
  //       .catch((e: Error) => console.error('Error upserting transaction:', e.message));
  //   }
  // }

  // await processCleanedLogs(cleanedLogs);
}
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
    const eventTag = edge.node.tags.find((tag) => tag.name === "Press Events - Optimism-Goerli v0.1");
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
    eventType: tags["Press Events - Optimism-Goerli v0.1"],
    tags,
  };
}

// optimism goerli
export async function processCleanedLogs(cleanedLogs: APLogs[]) {
  for (const log of cleanedLogs) {
    // console.log('log:', log);
    if (!log.args) {
      console.log(`Skipping log due to missing args: ${JSON.stringify(log)}`);
      continue;
    }
    console.log(`Processing log with event name: ${log.eventName}`);
    try {
      switch (log.eventName) {
        // leave create 
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
          // upsert 
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