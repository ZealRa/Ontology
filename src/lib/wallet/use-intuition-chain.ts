import { useWallets } from '@privy-io/react-auth';
import { useCallback } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';

import { INTUITION_CHAIN_ID } from './intuition-chain';

export function useIntuitionChain() {
  const { address, chainId, isConnected } = useAccount();
  const { wallets } = useWallets();
  const { switchChain, isPending: isWagmiSwitching } = useSwitchChain();

  const isWrongNetwork =
    isConnected && chainId !== undefined && chainId !== INTUITION_CHAIN_ID;

  const switchToIntuitionMainnet = useCallback(async () => {
    const ethereumWallet = wallets.find((wallet) => wallet.type === 'ethereum');

    if (ethereumWallet) {
      try {
        await ethereumWallet.switchChain(INTUITION_CHAIN_ID);
        return;
      } catch (privyError) {
        console.warn('Privy switchChain failed, trying wagmi:', privyError);
      }
    }

    await switchChain({ chainId: INTUITION_CHAIN_ID });
  }, [wallets, switchChain]);

  return {
    address,
    chainId,
    isConnected,
    isWrongNetwork,
    switchToIntuitionMainnet,
    isSwitching: isWagmiSwitching,
  };
}
