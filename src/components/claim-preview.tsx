import { PREDICATES } from '../data/predicates';
import { ATOM_TYPES, ATOM_CATEGORIES } from '../data/atom-types';
import { isSelfSubject } from '../lib/conjugate';
import {
  canShowClaimActions,
  getClaimBlockers,
  isClaimStructurallyComplete,
  type ClaimFormState,
} from '../lib/claim-readiness';

interface ClaimPreviewProps extends ClaimFormState {
  subjectLabel: string;
  predicateLabel: string;
  objectLabel: string;
  subjectTermId?: `0x${string}`;
  predicateTermId?: `0x${string}`;
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
  subject,
  subjectType,
  subjectAtom,
  predicateId,
  predicateLabel,
  object,
  objectType,
  subjectLabel,
  objectLabel,
  subjectTermId,
  predicateTermId,
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
  const formState: ClaimFormState = {
    subject,
    subjectType,
    predicateId,
    object,
    objectType,
    subjectAtom,
  };

  const showPreview = subjectType !== null || subjectLabel.trim().length > 0;
  if (!showPreview) return null;

  const hasSubject = subjectLabel.trim().length > 0;
  const hasPredicate = predicateId !== null;
  const hasObject = objectLabel.trim().length > 0;

  const predicate = PREDICATES.find((p) => p.id === predicateId);
  const subjectAtomType = ATOM_TYPES.find((t) => t.id === subjectType);
  const objectAtomType = ATOM_TYPES.find((t) => t.id === objectType);

  const showActions = canShowClaimActions(formState);
  const structurallyComplete = isClaimStructurallyComplete(formState);
  const blockers = getClaimBlockers(formState);
  const isSelf = isSelfSubject(subjectType);

  let isValid = false;
  let validationMessage = '';
  if (structurallyComplete && predicate && subjectType && objectType) {
    const subjectOk = predicate.subjectTypes.includes(subjectType);
    const objectOk = predicate.objectTypes.includes(objectType);
    isValid = subjectOk && objectOk;

    if (!subjectOk) {
      validationMessage = `"${predicate.label}" doesn't work with ${subjectType} subjects`;
    } else if (!objectOk) {
      validationMessage = `"${predicate.label}" expects: ${predicate.objectTypes.join(', ')}`;
    }
  }

  const canSubmit =
    structurallyComplete && isValid && canSubmitOnchain && !isSubmittingOnchain;

  const subjectColor = subjectAtomType
    ? ATOM_CATEGORIES[subjectAtomType.category].color
    : 'var(--color-text)';
  const objectColor = objectAtomType
    ? ATOM_CATEGORIES[objectAtomType.category].color
    : 'var(--color-text)';

  const displayedPredicate = hasPredicate && predicateLabel.trim()
    ? predicateLabel
    : '___';
  const displayedSubject = isSelf ? 'I' : subjectLabel;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-2">
        <span>Claim Preview</span>
        {showActions && (
          <span
            className={`text-xs font-medium ${
              structurallyComplete && isValid ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {structurallyComplete && isValid ? 'Ready' : 'Almost ready'}
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

      {showActions && blockers.length > 0 && (
        <ul className="mt-2 text-xs text-amber-400/90 list-disc list-inside space-y-0.5">
          {blockers.map((blocker) => (
            <li key={blocker}>{blocker}</li>
          ))}
        </ul>
      )}

      {validationMessage && (
        <p className="mt-2 text-xs text-red-400">{validationMessage}</p>
      )}

      {showActions && (
        <>
          {structurallyComplete && isValid && (
            <p className="mt-2 text-xs text-emerald-400/70">
              {displayedSubject} ({subjectType}) {displayedPredicate} {objectLabel} ({objectType})
            </p>
          )}

          {isSelf && predicate && hasObject && structurallyComplete && isValid && (
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
                disabled={!canSubmit}
                title={
                  !structurallyComplete
                    ? blockers[0]
                    : !isValid
                      ? validationMessage || 'Fix claim validity before submitting on-chain'
                      : !canSubmitOnchain
                        ? 'Connect your wallet on Intuition Mainnet'
                        : undefined
                }
                className="focus-ring rounded-md px-3 py-1.5 text-xs font-medium bg-emerald-500 text-black hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingOnchain ? 'Submitting…' : 'Submit on-chain'}
              </button>
            )}
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                disabled={!structurallyComplete || !isValid || isSubmittingOnchain}
                className="focus-ring rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save to History
              </button>
            )}
            {onAddToBatch && (
              <button
                type="button"
                onClick={onAddToBatch}
                disabled={!structurallyComplete || !isValid || isSubmittingOnchain}
                className="focus-ring rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
