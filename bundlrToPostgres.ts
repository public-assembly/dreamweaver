import { PrismaClient } from '@prisma/client';
import { Node, Transactions } from './interfaces/transactionInterfaces';
import { apolloClient } from './apolloClient';
import { NEW_TRANSACTIONS } from './gql';

// prisma initialization
const prisma = new PrismaClient();

// define the main function that fetches and processes transactions
async function main() {
  const { data } = await apolloClient.query({ query: NEW_TRANSACTIONS });
  const processedTransactions = processTransactions(data.transactions);

  // insert processedTransactions into the database using Prisma
  for (const transaction of processedTransactions) {
    if (transaction) {
      await prisma.transaction.create({
        data: transaction,
      });
    }
  }
}

// function to process transactions: extracts the event type from the tags and calls the corresponding shaping function
function processTransactions(transactions: Transactions) {
  return transactions.edges.map((edge) => {
    const eventTag = edge.node.tags.find((tag) => tag.name === 'Press Events');
    if (!eventTag) {
      return null;
    }
    const eventType = eventTag.value;
    const shapedData = shapeData(edge.node);
    switch (eventType) {
      case 'Create721Press':
      case 'DataStored':
      case 'DataRemoved':
      case 'DataOverwritten':
      case 'LogicUpdated':
      case 'PressInitialized':
      case 'RendererUpdated':
        return shapedData;
      default:
        return null;
    }
  });
}

// function to shape the data common to all transactions
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

// functions to shape the data specific to each event type. Currently, they all just call shapeData, but they could be customized in the future.
function shapeCreate721Press(node: Node) {
  return shapeData(node);
}

function shapeDataStored(node: Node) {
  return shapeData(node);
}

function shapeDataRemoved(node: Node) {
  return shapeData(node);
}

function shapeDataOverwritten(node: Node) {
  return shapeData(node);
}

function shapeLogicUpdated(node: Node) {
  return shapeData(node);
}

function shapePressInitialized(node: Node) {
  return shapeData(node);
}

function shapeRendererUpdated(node: Node) {
  return shapeData(node);
}

// not really currently used
export async function getTransactions() {
  const transactions = await prisma.transaction.findMany();
  console.log(transactions);
  return transactions;
}

// fetch and print all transactions from the database
getTransactions()
  .catch((e) => {
    throw e;
  })
  // disconnect
  .finally(async () => {
    await prisma.$disconnect();
  });

// run the main function and handle errors
main()
  .catch((e) => {
    console.error('Error running main: ', e);
    throw e;
  })
  // disconnect
  .finally(async () => {
    await prisma.$disconnect();
  });