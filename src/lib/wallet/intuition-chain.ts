import { defineChain } from 'viem';

/** Intuition Mainnet — chain ID 1155 (mission target network). */
export const INTUITION_CHAIN_ID = 1155;

export const intuitionMainnet = defineChain({
  id: INTUITION_CHAIN_ID,
  name: 'Intuition Mainnet',
  network: 'intuition-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'TRUST',
    symbol: 'TRUST',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.intuition.systems/http'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Intuition Explorer',
      url: 'https://explorer.intuition.systems',
    },
  },
});
