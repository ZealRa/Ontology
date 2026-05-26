import { createConfig } from '@privy-io/wagmi';
import { base, mainnet } from 'viem/chains';
import { http } from 'wagmi';

import { intuitionMainnet, intuitionTestnet } from './intuition-chain';

/** Mainnet + Base are read-only chains for ENS / Basename lookup; txs stay on Intuition. */
export const wagmiConfig = createConfig({
  chains: [intuitionMainnet, intuitionTestnet, mainnet, base],
  transports: {
    [intuitionMainnet.id]: http(intuitionMainnet.rpcUrls.default.http[0]),
    [intuitionTestnet.id]: http(intuitionTestnet.rpcUrls.default.http[0]),
    [mainnet.id]: http('https://ethereum-rpc.publicnode.com'),
    [base.id]: http('https://mainnet.base.org'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
