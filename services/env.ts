import { config } from 'dotenv';
import { objectKeys } from '../utils';

config();

interface Env {
  OWNER: string;
  CONTRACT_ADDRESS: string;
  ETHERSCAN_API_KEY: string;
  ALCHEMY_KEY: string;
}

const env: Env = {
  OWNER: process.env.OWNER as string,
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS as string,
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY as string,
  ALCHEMY_KEY: process.env.ALCHEMY_KEY as string,
};

objectKeys(env).forEach((key) => {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export default env;
