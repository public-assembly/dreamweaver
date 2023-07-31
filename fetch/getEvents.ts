import { fetchLogs } from './fetchLogs'
import { availableEventObjects, convertLog, getLastBlockNum } from './utils'
import { processCleanedLogs } from '../processAndUpload'
import { viemClient } from '../viem/client'
import { uploadLogs } from '../bundlr'
import { replacer } from '../utils'

export async function getEvents() {
  console.log('Fetching events...')

  const currentBlock = await viemClient.getBlockNumber()
  console.log(`Current block number is ${currentBlock}`)

  let fromBlock = await getLastBlockNum()
  const initialFromBlock = fromBlock

  const fetchPromises = []

  while (fromBlock <= currentBlock) {
    console.log('From block: ', fromBlock)
    const toBlock: bigint =
      fromBlock + BigInt(10000) > currentBlock
        ? currentBlock
        : fromBlock + BigInt(10000)

    // push the fetchLogs promise into the array
    fetchPromises.push(fetchLogs(fromBlock, toBlock))

    fromBlock = toBlock + BigInt(1)
  }

  // wait for all fetch operations to complete
  const allLogsArrays = await Promise.all(fetchPromises)

  // flatten the array of arrays into a single array
  const allLogs = allLogsArrays.flat()

  // sort allLogs
  allLogs.sort((a, b) => {
    if (a.blockNumber === null || b.blockNumber === null) {
      return 0
    }
    return Number(b.blockNumber) - Number(a.blockNumber)
  })

  const cleanedLogs = allLogs.map(convertLog)

  if (cleanedLogs.length === 0) {
    console.log('No logs to return.')
    return {
      cleanedLogs: [],
      logsJson: '{}',
      eventName: availableEventObjects[0].event,
    }
  }

  const logsJson = JSON.stringify(
    {
      jobAnalysis: {
        fromBlock: String(initialFromBlock),
        toBlock: String(currentBlock),
      },
      logs: {
        allEvents: cleanedLogs,
      },
    },
    replacer,
    2,
  )
  console.log('Returning logs...')

  await processCleanedLogs(cleanedLogs)

  if (cleanedLogs.length > 0) {
    await uploadLogs(cleanedLogs)
  }

  return { logsJson, cleanedLogs, eventName: availableEventObjects[0].event }
}
