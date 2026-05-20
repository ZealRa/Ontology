import { useIntuitionChain } from '../../lib/wallet/use-intuition-chain';
import { useWalletSession } from '../../lib/wallet/use-wallet-session';
import { WalletAddressMenu } from './wallet-address-menu';
import { WalletConnectLoading } from './wallet-connect-loading';
import { WalletConnectPrompt } from './wallet-connect-prompt';

export function WalletConnectButton() {
  const { ready, authenticated, connect, disconnect } = useWalletSession();
  const {
    address,
    isConnected,
    isWrongNetwork,
    switchToIntuitionMainnet,
    isSwitching,
  } = useIntuitionChain();

  const handleSwitchNetwork = async () => {
    try {
      await switchToIntuitionMainnet();
    } catch (error) {
      console.error('Network switch failed:', error);
    }
  };

  if (!ready) {
    return <WalletConnectLoading />;
  }

  if (!authenticated || !isConnected || !address) {
    return <WalletConnectPrompt onConnect={() => void connect()} />;
  }

  return (
    <WalletAddressMenu
      address={address}
      isWrongNetwork={isWrongNetwork}
      isSwitching={isSwitching}
      onSwitchNetwork={() => void handleSwitchNetwork()}
      onDisconnect={() => void disconnect()}
    />
  );
}
