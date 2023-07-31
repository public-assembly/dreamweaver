import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import env from '../services/env';


const transport = http(`${env.API_URL}v2/${env.ALCHEMY_KEY}`);

export const viemClient = createPublicClient({
  chain: sepolia,
  transport,
});
