import { config } from 'dotenv';
import { objectKeys } from '../utils';

config();

interface Env {
  OWNER: string;
  CONTRACT_ADDRESS: string;
  ETHERSCAN_API_KEY: string;
  ALCHEMY_KEY: string;
  OPTIMISM_GOERLI_API_KEY: string;
  API_URL: string;
  BUNDLR_FUNDING_CHAIN: string;
  SEPOLIA_ALCHEMY_KEY: string;
}

const env: Env = {
  OWNER: process.env.OWNER as string,
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS as string,
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY as string,
  ALCHEMY_KEY: process.env.ALCHEMY_KEY as string,
  OPTIMISM_GOERLI_API_KEY: process.env.OPTIMISM_GOERLI_API_KEY as string,
  API_URL: process.env.API_URL as string,
  BUNDLR_FUNDING_CHAIN: process.env.BUNDLR_FUNDING_CHAIN as string,
  SEPOLIA_ALCHEMY_KEY: process.env.SEPOLIA_ALCHEMY_KEY as string,
};

objectKeys(env).forEach((key) => {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export default env;
