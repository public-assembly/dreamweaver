import { DatabaseLog } from '../../interfaces/transactionInterfaces'
import { convertArgs } from './convertArgs'

// rome-ignore lint: allow explicit any
export function convertLog(log: any): DatabaseLog {
  // @ts-expect-error
  return {
    address: log.address,
    blockHash: log.blockHash,
    blockNumber: log.blockNumber,
    data: log.data,
    topics: log.topics,
    transactionHash: log.transactionHash,
    args: convertArgs(log.args as object), // Cast args to object
    eventName: log.eventName,
  }
}
