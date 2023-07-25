import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import env from '../services/env';

const transport = http(
  `https://eth-sepolia.g.alchemy.com/v2/${env.ALCHEMY_KEY}`
);

export const viemClient = createPublicClient({
  chain: sepolia,
  transport,
});
