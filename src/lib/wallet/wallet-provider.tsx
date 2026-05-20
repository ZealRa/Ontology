import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { IntuitionNetworkSync } from './intuition-network-sync';
import { privyConfig } from './privy-config';
import { wagmiConfig } from './wagmi-config';

const queryClient = new QueryClient();

function getPrivyAppId(): string | undefined {
  const appId = import.meta.env.VITE_PRIVY_APP_ID;
  return typeof appId === 'string' && appId.length > 0 ? appId : undefined;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const appId = getPrivyAppId();

  if (!appId) {
    return (
      <div
        role="alert"
        className="mx-4 mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-[var(--color-text)]"
      >
        <strong className="font-medium">Wallet disabled:</strong> set{' '}
        <code className="rounded bg-[var(--color-surface-raised)] px-1">VITE_PRIVY_APP_ID</code> in{' '}
        <code className="rounded bg-[var(--color-surface-raised)] px-1">.env.local</code> (see{' '}
        <code className="rounded bg-[var(--color-surface-raised)] px-1">.env.example</code>).
      </div>
    );
  }

  return (
    <PrivyProvider appId={appId} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <IntuitionNetworkSync />
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
