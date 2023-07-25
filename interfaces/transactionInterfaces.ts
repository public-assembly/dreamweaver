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

export interface APLogs extends Log {
  args?: {
    targetPress?: string;
    storeCaller?: string;
    tokenId?: bigint;
    pointer?: string;
    logic?: string;
    sender?: string;
    renderer?: string;
    newPress?: string;
    initialOwner?: string;
    initialLogic?: string;
    creator?: string;
    initialRenderer?: string;
    soulbound?: boolean;
  };
  eventName: string;
}
