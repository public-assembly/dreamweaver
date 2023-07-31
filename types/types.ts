import { type Abi, type Hex } from 'viem'

export type EventObject = {
  event: string
  abi: Abi
  address: Hex
}
