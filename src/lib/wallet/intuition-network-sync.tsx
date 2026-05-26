import { useEffect, useRef } from 'react';

import { useIntuitionNetwork } from './intuition-network-context';
import { useIntuitionChain } from './use-intuition-chain';

/**
 * Attempts once per session to move the wallet to the selected Intuition network
 * after connect. If the user declines or it fails, the manual switch remains available.
 */
export function IntuitionNetworkSync() {
  const { chainId: targetChainId } = useIntuitionNetwork();
  const { isWrongNetwork, switchToIntuitionChain } = useIntuitionChain();
  const attemptedForChainRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isWrongNetwork || attemptedForChainRef.current === targetChainId) return;

    attemptedForChainRef.current = targetChainId;
    void switchToIntuitionChain(targetChainId).catch((error) => {
      console.warn('Auto switch to Intuition network failed:', error);
    });
  }, [isWrongNetwork, switchToIntuitionChain, targetChainId]);

  return null;
}
