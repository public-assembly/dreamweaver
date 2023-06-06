import { client } from './viem';
import type { Hex } from 'viem';
import { ERC721PressFactoryAbi } from './abi';
import { SEPOLIA_ADDRESSES } from './contractAddresses/addresses';

export async function getPressCreationEvents() {
  // Create a filter to retrieve event logs
  const filter = await client.createContractEventFilter({
    abi: ERC721PressFactoryAbi,
    address: SEPOLIA_ADDRESSES.ERC721.ERC721_PRESS_FACTORY_PROXY as Hex,
    eventName: 'Create721Press',
    fromBlock: BigInt(3570435), // Contract creation block
  });
  // Return a list of event logs since the filter was created
  const logs = await client.getFilterLogs({ filter });

  // const prettyLogs = JSON.stringify(logs)

  console.log('Event logs', logs);

  // return prettyLogs;
}

getPressCreationEvents();
