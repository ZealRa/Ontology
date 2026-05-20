import { createConfig } from '@privy-io/wagmi';
import { base, mainnet } from 'viem/chains';
import { http } from 'wagmi';

import { intuitionMainnet } from './intuition-chain';

/** Mainnet + Base are read-only chains for ENS / Basename lookup; txs stay on Intuition. */
export const wagmiConfig = createConfig({
  chains: [intuitionMainnet, mainnet, base],
  transports: {
    [intuitionMainnet.id]: http(intuitionMainnet.rpcUrls.default.http[0]),
    [mainnet.id]: http('https://ethereum-rpc.publicnode.com'),
    [base.id]: http('https://mainnet.base.org'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
