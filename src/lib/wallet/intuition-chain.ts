import { intuitionMainnet, intuitionTestnet } from '@0xintuition/protocol';

export { intuitionMainnet, intuitionTestnet };

/** Intuition Mainnet — chain ID 1155. */
export const INTUITION_MAINNET_CHAIN_ID = intuitionMainnet.id;

/** Intuition Testnet — chain ID 13579. */
export const INTUITION_TESTNET_CHAIN_ID = intuitionTestnet.id;

/** @deprecated Use active chain from `useIntuitionNetwork()` instead. */
export const INTUITION_CHAIN_ID = INTUITION_MAINNET_CHAIN_ID;

export const INTUITION_CHAIN_IDS = [
  INTUITION_MAINNET_CHAIN_ID,
  INTUITION_TESTNET_CHAIN_ID,
] as const;

export type IntuitionChainId = (typeof INTUITION_CHAIN_IDS)[number];

/** Chain IDs accepted by wagmi `switchChain` / `usePublicClient` in this app. */
export type WagmiIntuitionChainId = typeof INTUITION_MAINNET_CHAIN_ID | typeof INTUITION_TESTNET_CHAIN_ID;

export function isIntuitionChainId(chainId: number): chainId is IntuitionChainId {
  return (INTUITION_CHAIN_IDS as readonly number[]).includes(chainId);
}

export function getIntuitionChain(chainId: number) {
  if (chainId === INTUITION_TESTNET_CHAIN_ID) return intuitionTestnet;
  return intuitionMainnet;
}
