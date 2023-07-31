import Bundlr from '@bundlr-network/client';
import env from '../services/env';

export const bundlr = new Bundlr(
  env.NODE_ENV === 'production'
    ? 'http://node1.bundlr.network'
    : 'http://devnet.bundlr.network',
  'ethereum',
  process.env.PRIVATE_KEY,
  {
    providerUrl: `${env.ALCHEMY_ENDPOINT}/v2/${env.ALCHEMY_KEY}`,
  }
);
