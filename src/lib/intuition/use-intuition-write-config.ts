import { getMultiVaultAddressFromChainId } from '@0xintuition/sdk';
import type { WriteConfig } from '@0xintuition/protocol';
import { useMemo } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';

import { INTUITION_CHAIN_ID } from '../wallet/intuition-chain';

export function useIntuitionWriteConfig(): WriteConfig | null {
  const publicClient = usePublicClient({ chainId: INTUITION_CHAIN_ID });
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!publicClient || !walletClient) return null;

    return {
      address: getMultiVaultAddressFromChainId(INTUITION_CHAIN_ID),
      publicClient,
      walletClient,
    };
  }, [publicClient, walletClient]);
}
