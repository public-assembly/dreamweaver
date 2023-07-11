import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import 'dotenv/config';

const transport = http(
  `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_SEPOLIA_KEY}`
);

export const client = createPublicClient({
  chain: sepolia,
  transport,
});
