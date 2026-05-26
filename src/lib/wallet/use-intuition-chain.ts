import { useWallets } from '@privy-io/react-auth';
import { useCallback } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';

import { useIntuitionNetwork } from './intuition-network-context';
import { type IntuitionChainId, isIntuitionChainId } from './intuition-chain';

export function useIntuitionChain() {
  const { chainId: targetChainId, networkLabel } = useIntuitionNetwork();
  const { address, chainId, isConnected } = useAccount();
  const { wallets } = useWallets();
  const { switchChain, isPending: isWagmiSwitching } = useSwitchChain();

  const isWrongNetwork =
    isConnected &&
    chainId !== undefined &&
    (chainId !== targetChainId || !isIntuitionChainId(chainId));

  const switchToIntuitionChain = useCallback(
    async (chainIdToSwitch: IntuitionChainId = targetChainId) => {
      const ethereumWallet = wallets.find((wallet) => wallet.type === 'ethereum');

      if (ethereumWallet) {
        try {
          await ethereumWallet.switchChain(chainIdToSwitch);
          return;
        } catch (privyError) {
          console.warn('Privy switchChain failed, trying wagmi:', privyError);
        }
      }

      await switchChain({ chainId: chainIdToSwitch });
    },
    [wallets, switchChain, targetChainId]
  );

  return {
    address,
    chainId,
    isConnected,
    isWrongNetwork,
    targetChainId,
    networkLabel,
    switchToIntuitionChain,
    /** @deprecated Use switchToIntuitionChain */
    switchToIntuitionMainnet: () => switchToIntuitionChain(targetChainId),
    switchToActiveNetwork: switchToIntuitionChain,
    isSwitching: isWagmiSwitching,
  };
}
