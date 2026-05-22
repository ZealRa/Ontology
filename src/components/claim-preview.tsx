import { PREDICATES } from '../data/predicates';
import { ATOM_TYPES, ATOM_CATEGORIES } from '../data/atom-types';
import { isSelfSubject } from '../lib/conjugate';

interface ClaimPreviewProps {
  /** Resolved on-chain label (existing atom or create label), not raw input. */
  subjectLabel: string;
  subjectType: string | null;
  subjectTermId?: `0x${string}`;
  predicateId: string | null;
  /** Resolved on-chain predicate label (existing atom or create label). */
  predicateLabel: string;
  predicateTermId?: `0x${string}`;
  /** Resolved on-chain label (existing atom or create label), not raw input. */
  objectLabel: string;
  objectType: string | null;
  objectTermId?: `0x${string}`;
  onSave?: () => void;
  onAddToBatch?: () => void;
  onSubmitOnchain?: () => void | Promise<void>;
  canSubmitOnchain?: boolean;
  isSubmittingOnchain?: boolean;
  onchainProgressLabel?: string | null;
  onchainError?: string | null;
  onchainSuccessMessage?: string | null;
}

export function ClaimPreview({
  subjectLabel,
  subjectType,
  subjectTermId,
  predicateId,
  predicateLabel,
  predicateTermId,
  objectLabel,
  objectType,
  objectTermId,
  onSave,
  onAddToBatch,
  onSubmitOnchain,
  canSubmitOnchain = false,
  isSubmittingOnchain = false,
  onchainProgressLabel,
  onchainError,
  onchainSuccessMessage,
}: ClaimPreviewProps) {
  const hasSubject = subjectLabel.trim().length > 0;
  const hasPredicate = predicateId !== null;
  const hasObject = objectLabel.trim().length > 0;

  if (!hasSubject) return null;

  const predicate = PREDICATES.find((p) => p.id === predicateId);
  const subjectAtom = ATOM_TYPES.find((t) => t.id === subjectType);
  const objectAtom = ATOM_TYPES.find((t) => t.id === objectType);

  const isComplete = hasSubject && hasPredicate && hasObject && subjectType && objectType;
  const isSelf = isSelfSubject(subjectType);

  // Check validity
  let isValid = false;
  let validationMessage = '';
  if (isComplete && predicate) {
    const subjectOk = predicate.subjectTypes.includes(subjectType);
    const objectOk = predicate.objectTypes.includes(objectType);
    isValid = subjectOk && objectOk;

    if (!subjectOk) {
      validationMessage = `"${predicate.label}" doesn't work with ${subjectType} subjects`;
    } else if (!objectOk) {
      validationMessage = `"${predicate.label}" expects: ${predicate.objectTypes.join(', ')}`;
    }
  }

  const subjectColor = subjectAtom
    ? ATOM_CATEGORIES[subjectAtom.category].color
    : 'var(--color-text)';
  const objectColor = objectAtom
    ? ATOM_CATEGORIES[objectAtom.category].color
    : 'var(--color-text)';

  const displayedPredicate = hasPredicate && predicateLabel.trim()
    ? predicateLabel
    : '___';

  // When the subject type is `Self`, the typed text is semantically moot —
  // the atom resolves to whoever stakes, regardless of what label the user
  // typed. Always display `I` so the preview matches the claim's real meaning.
  const displayedSubject = isSelf ? 'I' : subjectLabel;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-2">
        <span>Claim Preview</span>
        {isComplete && (
          <span className={`text-xs font-medium ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
            {isValid ? 'Valid' : 'Invalid'}
          </span>
        )}
        {isSelf && (
          <span
            className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `color-mix(in srgb, ${ATOM_CATEGORIES.self.color} 12%, transparent)`,
              color: ATOM_CATEGORIES.self.color,
              border: `1px solid color-mix(in srgb, ${ATOM_CATEGORIES.self.color} 30%, transparent)`,
            }}
          >
            Shared claim
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-base">
        <span style={{ color: subjectColor }}>{hasSubject ? displayedSubject : '___'}</span>
        <span className="text-[var(--color-text-muted)]">—</span>
        <span className="text-[var(--color-accent)]">{displayedPredicate}</span>
        <span className="text-[var(--color-text-muted)]">—</span>
        <span style={{ color: objectColor }}>{hasObject ? objectLabel : '___'}</span>
      </div>

      {(subjectTermId || predicateTermId || objectTermId) && (
        <p className="mt-2 text-[10px] font-mono text-[var(--color-text-muted)] space-y-0.5">
          {subjectTermId && (
            <span className="block truncate">Subject atom: {subjectTermId}</span>
          )}
          {predicateTermId && (
            <span className="block truncate">Predicate atom: {predicateTermId}</span>
          )}
          {objectTermId && (
            <span className="block truncate">Object atom: {objectTermId}</span>
          )}
        </p>
      )}

      {validationMessage && (
        <p className="mt-2 text-xs text-red-400">{validationMessage}</p>
      )}

      {isComplete && isValid && (
        <>
          <p className="mt-2 text-xs text-emerald-400/70">
            {displayedSubject} ({subjectType}) {displayedPredicate} {objectLabel} ({objectType})
          </p>

          {isSelf && predicate && hasObject && (
            <SharedClaimStakersPreview
              predicateLabel={displayedPredicate}
              object={objectLabel}
              objectColor={objectColor}
            />
          )}

          {onchainError && (
            <p className="mt-2 text-xs text-red-400">{onchainError}</p>
          )}
          {onchainSuccessMessage && (
            <p className="mt-2 text-xs text-emerald-400/80">{onchainSuccessMessage}</p>
          )}
          {onchainProgressLabel && isSubmittingOnchain && (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">{onchainProgressLabel}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {onSubmitOnchain && (
              <button
                type="button"
                onClick={() => void onSubmitOnchain()}
                disabled={!canSubmitOnchain || isSubmittingOnchain}
                className="focus-ring rounded-md px-3 py-1.5 text-xs font-medium bg-emerald-500 text-black hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingOnchain ? 'Submitting…' : 'Submit on-chain'}
              </button>
            )}
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                disabled={isSubmittingOnchain}
                className="focus-ring rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
              >
                Save to History
              </button>
            )}
            {onAddToBatch && (
              <button
                type="button"
                onClick={onAddToBatch}
                disabled={isSubmittingOnchain}
                className="focus-ring rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors disabled:opacity-50"
              >
                Add to Batch
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Shows how a `Self`-subject claim renders from different stakers' points of
 * view so the aggregation benefit is tangible — one claim, N signals.
 */
function SharedClaimStakersPreview({
  predicateLabel,
  object,
  objectColor,
}: {
  predicateLabel: string;
  object: string;
  objectColor: string;
}) {
  const sampleStakers = [
    { label: 'you stake', identity: 'you' },
    { label: 'Alice stakes', identity: 'Alice' },
    { label: 'a wallet stakes', identity: '0xabc…' },
  ];

  return (
    <div className="mt-3 rounded-md border border-[var(--color-border)]/60 bg-[var(--color-surface)]/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
        How stakers read this claim
      </p>
      <ul className="space-y-1 font-mono text-xs">
        {sampleStakers.map(({ label, identity }) => (
          <li key={label} className="flex items-center gap-2">
            <span className="text-[var(--color-text-muted)] w-28 shrink-0">When {label}:</span>
            <span className="text-[var(--color-text-secondary)]">→</span>
            <span className="text-[var(--color-text)]">{identity}</span>
            <span className="text-[var(--color-text-muted)]">—</span>
            <span className="text-[var(--color-accent)]">{predicateLabel}</span>
            <span className="text-[var(--color-text-muted)]">—</span>
            <span style={{ color: objectColor }}>{object}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

