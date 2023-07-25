import { APLogs } from '../interfaces/transactionInterfaces';

export function cleanLog(log: APLogs) {
  const {
    address = '0x0', // Default value
    blockNumber = BigInt(0),
    blockHash = '0x0', // Default value
    args = {},
    eventName,
    data = '0x0', // Default value
    logIndex = 0, // Default value
    transactionHash = '0x0', // Default value
    transactionIndex = 0, // Default value
    removed = false, // Default value
    topics = [], // Default value
  } = log;

  return {
    address,
    blockNumber,
    blockHash,
    args,
    eventName,
    data,
    logIndex,
    transactionHash,
    transactionIndex,
    removed,
    topics,
  };
}
