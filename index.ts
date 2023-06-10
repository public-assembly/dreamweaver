// Import the Bundlr object for server-side connections
import Bundlr from '@bundlr-network/client';
// Import fs (File system) to retrieve file sizes
import * as fs from 'fs';
// Import and configure dotenv
import 'dotenv/config';
// Import event fetching function
import { getPressCreationEvents } from './fetchEvents';

async function main() {
  // Set up a reference to a bundlr object
  const bundlr = new Bundlr(
    'http://devnet.bundlr.network',
    'ethereum',
    process.env.PRIVATE_KEY,
    {
      // Required to provide an RPC URL when using the dev net
      providerUrl: 'https://eth-goerli.g.alchemy.com/v2/demo',
    }
  );

  console.log('Connected wallet address:', bundlr.address);

  /**
   * Set up upfront funding to the node
   * Value supplied should be in atomic units
   *
   * .25 Ether * 1e18 Wei/Ether = 2.5e17 Wei
   *
   * .1 Ether * 1e18 Wei/Ether 1e17 Wei
   */
  // const fundTx = await bundlr.fund(1e17);

  // Query the your wallet balance on the connected node
  const atomicBalance = await bundlr.getLoadedBalance();

  const convertedBalance = bundlr.utils.fromAtomic(atomicBalance).toString();

  // console.log('Account balance:', convertedBalance);

  const logsJson = await getPressCreationEvents();

  // console.log('Press creation events:', logs);

  console.log(typeof logsJson);

  const response = await bundlr.upload(logsJson);

  console.log(`File uploaded ==> https://arweave.net/${response.id}`);

  const pathToData = `https://arweave.net/${response.id}`;

  // const pathToFile = './images/your_image.png';

  // const response = await bundlr.uploadFile(pathToFile);

  // console.log('File uploaded:', `https://arweave.net/${response.id}`);

  return pathToData;
}

main();
