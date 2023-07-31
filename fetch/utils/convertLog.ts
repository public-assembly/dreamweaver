import { APLogs } from '../../interfaces/transactionInterfaces';
import { convertArgs } from './convertArgs';

export function convertLog(log: any): APLogs {
  return {
    address: log.address,
    blockHash: log.blockHash,
    blockNumber: log.blockNumber,
    data: log.data,
    topics: log.topics,
    transactionHash: log.transactionHash,
    args: convertArgs(log.args as object), // Cast args to object
    eventName: log.eventName,
  };
}
