import { createPublicClient, http } from 'viem';
import {
  mainnet,
  sepolia,
  optimism,
  optimismGoerli,
  zora,
  zoraTestnet,
} from 'viem/chains';
import env from '../services/env';

const transport = http(`${env.ALCHEMY_ENDPOINT}v2/${env.ALCHEMY_KEY}`);

const chainObject = {
  [mainnet.id]: mainnet,
  [sepolia.id]: sepolia,
  [optimism.id]: optimism,
  [optimismGoerli.id]: optimismGoerli,
  [zora.id]: zora,
  [zoraTestnet.id]: zoraTestnet,
  // Add other chains here...
};

export const viemClient = createPublicClient({
  // @ts-expect-error
  chain: chainObject[Number(env.CHAIN_ID)],
  transport,
});
