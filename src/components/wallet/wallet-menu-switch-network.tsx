type WalletMenuSwitchNetworkProps = {
  isSwitching: boolean;
  onSwitch: () => void;
};

export function WalletMenuSwitchNetwork({ isSwitching, onSwitch }: WalletMenuSwitchNetworkProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={isSwitching}
      onClick={() => void onSwitch()}
      className="focus-ring w-full px-3 py-2 text-left text-sm font-medium text-black bg-amber-400/90 hover:bg-amber-300 disabled:opacity-60"
    >
      {isSwitching ? 'Switching…' : 'Switch to Intuition Mainnet'}
    </button>
  );
}
