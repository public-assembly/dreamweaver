export const ERC721PressFactoryAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_pressImpl',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_databaseImpl',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'Address_Cannot_Be_Zero',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'newPress',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'databaseImpl',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address payable',
            name: 'fundsRecipient',
            type: 'address',
          },
          {
            internalType: 'uint16',
            name: 'royaltyBPS',
            type: 'uint16',
          },
          {
            internalType: 'bool',
            name: 'transferable',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct IERC721Press.Settings',
        name: 'settings',
        type: 'tuple',
      },
    ],
    name: 'Create721Press',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'databaseImpl',
        type: 'address',
      },
    ],
    name: 'DatabaseImplementationSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'pressImpl',
        type: 'address',
      },
    ],
    name: 'PressImplementationSet',
    type: 'event',
  },
  {
    inputs: [],
    name: 'contractVersion',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'initialOwner',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'databaseInit',
        type: 'bytes',
      },
      {
        components: [
          {
            internalType: 'address payable',
            name: 'fundsRecipient',
            type: 'address',
          },
          {
            internalType: 'uint16',
            name: 'royaltyBPS',
            type: 'uint16',
          },
          {
            internalType: 'bool',
            name: 'transferable',
            type: 'bool',
          },
        ],
        internalType: 'struct IERC721Press.Settings',
        name: 'settings',
        type: 'tuple',
      },
    ],
    name: 'createPress',
    outputs: [
      {
        internalType: 'address',
        name: 'press',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'databaseImpl',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pressImpl',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;