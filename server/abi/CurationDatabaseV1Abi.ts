export const CurationDatabaseV1Abi =  [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "targetPress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "storeCaller",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "pointer",
        "type": "address"
      }
    ],
    "name": "DataStored",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "targetPress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "logic",
        "type": "address"
      }
    ],
    "name": "LogicUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "targetPress",
        "type": "address"
      }
    ],
    "name": "PressInitialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "targetPress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "renderer",
        "type": "address"
      }
    ],
    "name": "RendererUpdated",
    "type": "event"
  }
];