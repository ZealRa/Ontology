type WalletIdentityBlockProps = {
  address: `0x${string}`;
  ensName: string | null;
};

export function WalletIdentityBlock({ address, ensName }: WalletIdentityBlockProps) {
  return (
    <div className="px-3 py-2 border-b border-[var(--color-border)]">
      {ensName && (
        <p className="text-sm font-medium text-[var(--color-popover-foreground)] truncate">
          {ensName}
        </p>
      )}
      <p className="text-xs font-mono text-[var(--color-text-muted)] break-all">{address}</p>
    </div>
  );
}
