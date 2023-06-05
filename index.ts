// Import the Bundlr object for server-side connections
import Bundlr from '@bundlr-network/client';
// Import fs (File system) to retrieve file sizes
import * as fs from 'fs';
// Import and configure dotenv
import 'dotenv/config';

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
}

main();
