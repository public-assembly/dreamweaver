import { viemClient } from '../viem';
import { EventObject } from '../types';


// function to fetch logs for given blocks and event objects
export async function fetchLogs(
  fromBlock: bigint,
  toBlock: bigint,
  eventObjects: EventObject[]
) {
  // create event filters for each eventObject
  const filters = await Promise.all(
    eventObjects.map((eventObject) =>
      viemClient.createContractEventFilter({
        abi: eventObject.abi,
        address: eventObject.address,
        eventName: eventObject.event,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      })
    )
  );

  console.log(
    `Filter created for blocks ${fromBlock} to ${toBlock}, getting logs...`
  );

  // fetch logs for each filter
  const logs = await Promise.all(
    filters.map((filter, index) =>
      viemClient
        // TODO: type this as 'Filter' once viem has been updated to export that type
        .getFilterLogs({ filter: filter as any })
        .then((logs) =>
          logs.map((log) => ({ ...log, eventName: eventObjects[index].event }))
        )
    )
  );
  return logs.flat();
}
