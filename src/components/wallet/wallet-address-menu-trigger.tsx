import { ChevronDownIcon } from './wallet-icons';

type WalletAddressMenuTriggerProps = {
  label: string;
  ensName: string | null;
  address: `0x${string}`;
  open: boolean;
  menuId: string;
  onToggle: () => void;
};

export function WalletAddressMenuTrigger({
  label,
  ensName,
  address,
  open,
  menuId,
  onToggle,
}: WalletAddressMenuTriggerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={menuId}
      className={`focus-ring h-8 max-w-[10rem] inline-flex items-center gap-1.5 rounded-md px-3 text-sm text-[var(--color-text-muted)] bg-[var(--color-surface-raised)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] ${ensName ? 'font-medium truncate' : 'font-mono'}`}
      title={ensName ? `${ensName} (${address})` : address}
    >
      <span className="truncate">{label}</span>
      <ChevronDownIcon open={open} />
    </button>
  );
}
