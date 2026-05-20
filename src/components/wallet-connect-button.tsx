import { usePrivy } from '@privy-io/react-auth';

import { useIntuitionChain } from '../lib/wallet/use-intuition-chain';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const { ready, authenticated, login, logout, connectWallet } = usePrivy();
  const {
    address,
    isConnected,
    isWrongNetwork,
    switchToIntuitionMainnet,
    isSwitching,
  } = useIntuitionChain();

  const displayAddress = address ?? null;

  if (!ready) {
    return (
      <span
        className="h-8 inline-flex items-center rounded-md px-3 text-sm text-[var(--color-text-muted)]"
        aria-live="polite"
      >
        Wallet…
      </span>
    );
  }

  const handleConnect = async () => {
    try {
      if (authenticated) {
        await connectWallet();
      } else {
        await login();
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Wallet disconnect failed:', error);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToIntuitionMainnet();
    } catch (error) {
      console.error('Network switch failed:', error);
    }
  };

  if (!authenticated || !isConnected || !displayAddress) {
    return (
      <button
        type="button"
        onClick={() => void handleConnect()}
        className="focus-ring h-8 inline-flex items-center rounded-md px-3 text-sm font-medium text-[var(--color-text)] bg-[var(--color-surface-raised)] transition-colors hover:bg-[var(--color-surface-hover)]"
      >
        Connect wallet
      </button>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => void handleSwitchNetwork()}
          disabled={isSwitching}
          className="focus-ring h-8 inline-flex items-center rounded-md px-3 text-sm font-medium text-black bg-amber-400 transition-colors hover:bg-amber-300 disabled:opacity-60"
        >
          {isSwitching ? 'Switching…' : 'Switch to Intuition Mainnet'}
        </button>
        <button
          type="button"
          onClick={() => void handleDisconnect()}
          className="focus-ring h-8 inline-flex items-center rounded-md px-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span
        className="h-8 inline-flex items-center rounded-md px-3 text-sm font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-raised)]"
        title={displayAddress}
      >
        {truncateAddress(displayAddress)}
      </span>
      <button
        type="button"
        onClick={() => void handleDisconnect()}
        className="focus-ring h-8 inline-flex items-center rounded-md px-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
      >
        Disconnect
      </button>
    </div>
  );
}
