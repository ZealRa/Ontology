import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';

import { intuitionMainnet } from './intuition-chain';

export const wagmiConfig = createConfig({
  chains: [intuitionMainnet],
  transports: {
    [intuitionMainnet.id]: http(intuitionMainnet.rpcUrls.default.http[0]),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
