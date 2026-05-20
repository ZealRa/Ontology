import { base, mainnet } from 'viem/chains';
import { useEnsName } from 'wagmi';

const ENS_QUERY = {
  enabled: true,
  staleTime: 5 * 60_000,
  retry: 1,
} as const;

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Reverse ENS lookup: Ethereum (.eth) and Base (.base.eth / Basenames).
 * Requires a primary/reverse record on the wallet address.
 */
export function useWalletDisplay(address: `0x${string}` | undefined) {
  const enabled = Boolean(address);

  const { data: mainnetName } = useEnsName({
    address,
    chainId: mainnet.id,
    query: { ...ENS_QUERY, enabled },
  });

  const { data: baseName } = useEnsName({
    address,
    chainId: base.id,
    query: { ...ENS_QUERY, enabled },
  });

  const ensName = mainnetName ?? baseName ?? null;
  const fallback = address ? truncateAddress(address) : '';

  return {
    label: ensName ?? fallback,
    ensName,
    address: address ?? null,
  };
}
