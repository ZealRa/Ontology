import { useDropdownMenu } from '../../lib/use-dropdown-menu';
import { useWalletDisplay } from '../../lib/wallet/use-wallet-display';
import { WalletAddressMenuPanel } from './wallet-address-menu-panel';
import { WalletAddressMenuTrigger } from './wallet-address-menu-trigger';

export type WalletAddressMenuProps = {
  address: `0x${string}`;
  isWrongNetwork: boolean;
  isSwitching: boolean;
  onSwitchNetwork: () => void;
  onDisconnect: () => void;
};

export function WalletAddressMenu({
  address,
  isWrongNetwork,
  isSwitching,
  onSwitchNetwork,
  onDisconnect,
}: WalletAddressMenuProps) {
  const { label, ensName } = useWalletDisplay(address);
  const { open, close, toggle, rootRef, menuId } = useDropdownMenu();

  const handleDisconnect = () => {
    close();
    onDisconnect();
  };

  const handleSwitchNetwork = () => {
    close();
    onSwitchNetwork();
  };

  return (
    <div ref={rootRef} className="relative">
      <WalletAddressMenuTrigger
        label={label}
        ensName={ensName}
        address={address}
        open={open}
        menuId={menuId}
        onToggle={toggle}
      />

      {open && (
        <WalletAddressMenuPanel
          menuId={menuId}
          address={address}
          ensName={ensName}
          isWrongNetwork={isWrongNetwork}
          isSwitching={isSwitching}
          onSwitchNetwork={handleSwitchNetwork}
          onDisconnect={handleDisconnect}
        />
      )}
    </div>
  );
}
