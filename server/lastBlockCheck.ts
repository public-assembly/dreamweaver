import fs from 'fs';
import path from 'path';

const BLOCK_NUMBER_FILE_PATH = path.resolve(__dirname, 'lastCheckedBlock.txt');

export async function getLastCheckedBlock(): Promise<bigint> {
  try {
    if (fs.existsSync(BLOCK_NUMBER_FILE_PATH)) {
      console.log('Reading last checked block number from file...');
      const blockNumber = await fs.promises.readFile(BLOCK_NUMBER_FILE_PATH, 'utf8');
      console.log(`Last checked block number is ${blockNumber}`);
      return BigInt(blockNumber);
    } else {
      console.log('File does not exist, returning hardcoded block number 3570435');
      return BigInt(3570818);
    }
  } catch (error) {
    console.error(`Failed to get last checked block number: ${error}`);
    throw error;
  }
}

export async function updateLastCheckedBlock(blockNumber: bigint): Promise<void> {
  console.log(`Updating last checked block number to ${blockNumber}`);
  try {
    await fs.promises.writeFile(BLOCK_NUMBER_FILE_PATH, blockNumber.toString(), 'utf8');
    console.log('Block number updated successfully');
  } catch (error) {
    console.error(`Failed to update block number: ${error}`);
    throw error;
  }
}
