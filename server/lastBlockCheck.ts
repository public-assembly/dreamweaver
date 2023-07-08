import fs from 'fs';
import path from 'path';

// Define the path to the file where the block number will be stored
const BLOCK_NUMBER_FILE_PATH = path.resolve(__dirname, 'lastCheckedBlock.txt');

// Function to get the last checked block number
export async function getLastCheckedBlock(): Promise<bigint> {
  try {
    // Check if the file exists
    if (fs.existsSync(BLOCK_NUMBER_FILE_PATH)) {
      // If the file exists, read the block number from the file
      console.log('Reading last checked block number from file...');
      const blockNumber = await fs.promises.readFile(BLOCK_NUMBER_FILE_PATH, 'utf8');
      console.log(`Last checked block number is ${blockNumber}`);
      return BigInt(blockNumber);
    } else {
      // If the file does not exist, return the hardcoded block number
      console.log('File does not exist, returning hardcoded block number 3570435');
      return BigInt(3570818);
    }
  } catch (error) {
    console.error(`Failed to get last checked block number: ${error}`);
    // If an error occurs, return the hardcoded block number
    return BigInt(3570818);
  }
}

// Function to update the last checked block number
export async function updateLastCheckedBlock(blockNumber: bigint): Promise<void> {
  console.log(`Updating last checked block number to ${blockNumber}`);
  try {
    // Write the block number to the file
    await fs.promises.writeFile(BLOCK_NUMBER_FILE_PATH, blockNumber.toString(), 'utf8');
    console.log('Block number updated successfully');
  } catch (error) {
    console.error(`Failed to update block number: ${error}`);
  }
}