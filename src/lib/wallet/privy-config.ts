import type { PrivyClientConfig } from '@privy-io/react-auth';

import { intuitionMainnet, intuitionTestnet } from './intuition-chain';

export const privyConfig: PrivyClientConfig = {
  supportedChains: [intuitionMainnet, intuitionTestnet],
  defaultChain: intuitionMainnet,
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
    showWalletUIs: true,
  },
  loginMethods: ['wallet', 'email', 'google'],
  appearance: {
    theme: 'dark',
    showWalletLoginFirst: true,
    walletChainType: 'ethereum-only',
  },
};
