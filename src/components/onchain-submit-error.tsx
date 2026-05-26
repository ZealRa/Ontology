import type { FormattedOnchainError } from '../lib/intuition/format-onchain-error';

export function OnchainSubmitError({ error }: { error: FormattedOnchainError }) {
  return (
    <div
      role="alert"
      className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs"
    >
      <p className="font-semibold text-red-300">{error.title}</p>
      <p className="mt-1 text-red-400/90 leading-relaxed">{error.description}</p>
      {error.hint && (
        <p className="mt-2 text-[var(--color-text-muted)] leading-relaxed">{error.hint}</p>
      )}
    </div>
  );
}
