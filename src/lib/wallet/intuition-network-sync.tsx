import { useEffect, useRef } from 'react';

import { useIntuitionChain } from './use-intuition-chain';

/**
 * Attempts once per session to move the wallet to Intuition Mainnet after connect.
 * If the user declines or it fails, the manual switch button remains available.
 */
export function IntuitionNetworkSync() {
  const { isWrongNetwork, switchToIntuitionMainnet } = useIntuitionChain();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!isWrongNetwork || attemptedRef.current) return;

    attemptedRef.current = true;
    void switchToIntuitionMainnet().catch((error) => {
      console.warn('Auto switch to Intuition Mainnet failed:', error);
    });
  }, [isWrongNetwork, switchToIntuitionMainnet]);

  return null;
}
