import { WalletIdentityBlock } from './wallet-identity-block';
import { WalletMenuDisconnect } from './wallet-menu-disconnect';
import { WalletMenuSwitchNetwork } from './wallet-menu-switch-network';

type WalletAddressMenuPanelProps = {
  menuId: string;
  address: `0x${string}`;
  ensName: string | null;
  isWrongNetwork: boolean;
  isSwitching: boolean;
  onSwitchNetwork: () => void;
  onDisconnect: () => void;
};

export function WalletAddressMenuPanel({
  menuId,
  address,
  ensName,
  isWrongNetwork,
  isSwitching,
  onSwitchNetwork,
  onDisconnect,
}: WalletAddressMenuPanelProps) {
  return (
    <div
      id={menuId}
      role="menu"
      className="absolute right-0 z-50 mt-1 min-w-[12rem] rounded-md border border-[var(--color-border)] bg-[var(--color-popover)] py-1 shadow-lg"
    >
      <WalletIdentityBlock address={address} ensName={ensName} />

      {isWrongNetwork && (
        <WalletMenuSwitchNetwork isSwitching={isSwitching} onSwitch={onSwitchNetwork} />
      )}

      <WalletMenuDisconnect onDisconnect={onDisconnect} />
    </div>
  );
}
