import Bundlr from '@bundlr-network/client';
import env from '../services/env';

// initialize bundlr
export const bundlr = new Bundlr(
  'http://devnet.bundlr.network',
  'ethereum',
  process.env.PRIVATE_KEY,
  {
    providerUrl: `${env.BUNDLR_FUNDING_CHAIN}/v2/${env.SEPOLIA_ALCHEMY_KEY}`,
  }
);
