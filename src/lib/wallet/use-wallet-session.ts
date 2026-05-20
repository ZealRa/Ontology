import { usePrivy } from '@privy-io/react-auth';
import { useCallback } from 'react';

export function useWalletSession() {
  const { ready, authenticated, login, logout, connectWallet } = usePrivy();

  const connect = useCallback(async () => {
    try {
      if (authenticated) {
        await connectWallet();
      } else {
        await login();
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  }, [authenticated, connectWallet, login]);

  const disconnect = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Wallet disconnect failed:', error);
    }
  }, [logout]);

  return {
    ready,
    authenticated,
    connect,
    disconnect,
  };
}
