type WalletConnectPromptProps = {
  onConnect: () => void;
};

export function WalletConnectPrompt({ onConnect }: WalletConnectPromptProps) {
  return (
    <button
      type="button"
      onClick={() => void onConnect()}
      className="focus-ring h-8 inline-flex items-center rounded-md px-3 text-sm font-medium text-[var(--color-text)] bg-[var(--color-surface-raised)] transition-colors hover:bg-[var(--color-surface-hover)]"
    >
      Connect wallet
    </button>
  );
}
