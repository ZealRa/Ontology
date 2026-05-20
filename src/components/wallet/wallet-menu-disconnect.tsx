type WalletMenuDisconnectProps = {
  onDisconnect: () => void;
};

export function WalletMenuDisconnect({ onDisconnect }: WalletMenuDisconnectProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => void onDisconnect()}
      className="focus-ring w-full px-3 py-2 text-left text-sm text-[var(--color-popover-foreground)] transition-colors hover:bg-[var(--color-surface-hover)]"
    >
      Disconnect
    </button>
  );
}
