import { type Log } from 'viem';

export interface Tag {
  name: string;
  value: string;
}

export interface Node {
  id: string;
  address: string;
  tags: Tag[];
}

export interface Edge {
  node: Node;
}

export interface Transactions {
  edges: Edge[];
}

export interface GraphQLResponse {
  transactions: Transactions;
}

// sepolia
// export interface APLogs extends Log {
//   args?: {
//     targetPress?: string;
//     storeCaller?: string;
//     tokenId?: bigint;
//     pointer?: string;
//     logic?: string;
//     sender?: string;
//     renderer?: string;
//     newPress?: string;
//     initialOwner?: string;
//     initialLogic?: string;
//     creator?: string;
//     initialRenderer?: string;
//     soulbound?: boolean;
//   };
//   eventName: string;
// }

// optimism goerli

// export interface APLogs extends Log {
//   args?: {
//     ap721?: string;
//     sender?: string;
//     initialOwner?: string;
//     logic?: string;
//     renderer?: string;
//     factory?: string;
//     target?: string;
//     store?: string;
//     tokenId?: bigint;
//     pointer?: string;
//   }
//   eventName: string;
// }

export interface APLogs {
  address: string;
  blockHash: string;
  blockNumber: bigint;
  data: string;
  logIndex?: number;
  removed?: boolean;
  topics: [] | [signature: `0x${string}`];
  transactionHash: string;
  transactionIndex?: number;
  args?: {
    ap721?: string;
    sender?: string;
    initialOwner?: string;
    logic?: string;
    renderer?: string;
    factory?: string;
    target?: string;
    tokenId?: bigint;
    pointer?: string;
  };
  eventName: string;
}


