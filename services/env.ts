import { config } from 'dotenv';
import { objectKeys } from '../utils';

config();

interface Env {
  NODE_ENV: string;
  OWNER: string;
  CONTRACT_ADDRESS: string;
  CHAIN_ID: string;
  ALCHEMY_KEY: string;
  ALCHEMY_ENDPOINT: string;
  ETHERSCAN_API_KEY: string;
  OPTIMISTIC_ETHERSCAN_API_KEY: string;
  ETHERSCAN_ENDPOINT: string;
  BUNDLR_FUNDING_CHAIN: string;
}

const env: Env = {
  NODE_ENV: process.env.NODE_ENV as string,
  OWNER: process.env.OWNER as string,
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS as string,
  CHAIN_ID: process.env.CHAIN_ID as string,
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY as string,
  ALCHEMY_KEY: process.env.ALCHEMY_KEY as string,
  ALCHEMY_ENDPOINT: process.env.ALCHEMY_ENDPOINT as string,
  OPTIMISTIC_ETHERSCAN_API_KEY: process.env
    .OPTIMISTIC_ETHERSCAN_API_KEY as string,
  ETHERSCAN_ENDPOINT: process.env.ETHERSCAN_ENDPOINT as string,
  BUNDLR_FUNDING_CHAIN: process.env.BUNDLR_FUNDING_CHAIN as string,
};

objectKeys(env).forEach((key) => {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export default env;
