## Dreamweaver

Onchain event listener processing Assembly Press protocol events and posting them to Arweave.

## Prerequisites 

make sure you have Node.js installed on your local system. If not, download and install it from the official [Node.js website](https://nodejs.org/en/download/).

## Installation

1. Clone the repo:
```
git clone [Your repository URL here]
```
2. Go into the repository:
```
cd [Your repository directory]
```
3. Install the dependencies:
```
pnpm install
```
4. Setup your environment variables by creating a `.env` file at the root of your project. You need to set up your database url in the following format:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE"
```
Replace `USER`, `PASSWORD`, and `DATABASE` with your PostgreSQL username, password, and database name, respectively.

also make sure you include:

ALCHEMY_SEPOLIA_KEY=
ETHERSCAN_API_KEY=
PRIVATE_KEY='' (for funding bundlr with eth)

## Running

to start indexer and check for events related from the given addresses:

pnpm ts-node index.ts

to send to Postgres using prisma:

npx prisma generate -- schema== prisma/schema.prisma
npx prisma migrate dev --name init
npx prisma migrate deploy
npx prisma db pull
pnpm ts-node bundlrToPostgres.ts

## Files

Here is a brief overview of the important files and their functions:

- `index.ts`: starts by logging the Ethereum address connected to the Bundlr client, and the balance of that address. The balance is calculated by calling Bundlr's `getLoadedBalance` method and converting the returned atomic balance to a human-readable format. Next, the `getEvents` function is called to fetch event logs from Ethereum. If no new logs are found, the script logs this information and returns early to stop the execution. If new logs are found, they are parsed into a JSON object and then into an array of log objects. The script then retrieves the block number from the last log in the array. The block number is incremented by one to get the `fromBlock` value for the next execution. This is the block number from which the next log fetching will start. The `fromBlock` value is logged to the console for debugging purposes.

- `bundlrInit.ts` : initializes bundlr 

- `bundlrAction.ts`:  handles Bundlr related actions: initializing Bundlr and Apollo client, creating metadata for Bundlr uploads, uploading logs to Arweave, fetching the last block from the last event in a transaction hash ID, and uploading log objects.

- `bundlrToPostgres.ts`: handles the integration between the Bundlr network and your PostgreSQL database via Prisma. It fetches new transactions from the Bundlr network using Apollo Client, processes them, and inserts them into your PostgreSQL database using Prisma.

- `schema.prisma`: contains the database schema for the Prisma client. It describes the `User` and `Transaction` models.

- `fetchEvents.ts`:  fetches logs for specific events occurring in Ethereum smart contracts, such as CREATE_PRESS and DATA_STORED, using the viem client. It retrieves the logs within a certain block range and uploads the logs to Arweave.

- `getEvents.ts`: fetches events from Ethereum. It uses a list of event objects, each with its respective ABI and address, to fetch logs from the Ethereum blockchain. It first retrieves the current block number and the last block where an event was found. It then fetches logs in chunks of 10,000 blocks (adjustable), starting from the last block where an event was found to the current block. If no logs are found, it returns an empty JSON object. If logs are found, they are added to an array of all logs, converted to a JSON string, and then uploaded to Arweave.

- `transactionInterfaces.ts` : defines interface for Transaction[]

- `viem.ts` : sets viem client 

- `apolloClient.ts` : sets apollo client 

- `events.ts`: contains a set of predefined events that the application might use or trigger.

- `addresses.ts`: contains a set of predefined  addresses using the `viem` library. 

- `replacer.ts`: a helper function that converts any `bigint` values to strings when working with JSON.

- `newTransaction.ts`: a graphQL query for returning a set of event tags made by a hardcoded owner

- `types.ts`: sets type for EventObjects[]




