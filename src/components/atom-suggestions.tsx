import { relevanceScore } from '../lib/intuition/search-atoms';
import { useAtomSuggestions } from '../lib/intuition/use-atom-suggestions';
import type { AtomSuggestion, ProtocolAtomResolution } from '../lib/intuition/types';

const CLOSE_MATCH_SCORE = 50;

function SuggestionRow({
  suggestion,
  onSelect,
}: {
  suggestion: AtomSuggestion;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="focus-ring w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <span className="text-[var(--color-text)]">{suggestion.label}</span>
        <span className="block font-mono text-[10px] text-[var(--color-text-muted)] truncate">
          {suggestion.termId}
        </span>
      </button>
    </li>
  );
}

type AtomSuggestionsProps = {
  fieldLabel: string;
  query: string;
  enabled: boolean;
  selection: ProtocolAtomResolution | null;
  onSelectExisting: (suggestion: AtomSuggestion) => void;
  onChooseCreate: () => void;
  onClearSelection: () => void;
};

export function AtomSuggestions({
  fieldLabel,
  query,
  enabled,
  selection,
  onSelectExisting,
  onChooseCreate,
  onClearSelection,
}: AtomSuggestionsProps) {
  const { suggestions, broadened, isSearching, error } = useAtomSuggestions(query, enabled);
  const trimmed = query.trim();
  const listOpen = selection === null;

  const closeSuggestions = suggestions.filter(
    (s) => relevanceScore(s.label, trimmed) >= CLOSE_MATCH_SCORE
  );
  const otherSuggestions = suggestions.filter(
    (s) => relevanceScore(s.label, trimmed) < CLOSE_MATCH_SCORE
  );

  if (!enabled || trimmed.length < 1) return null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          On-chain atoms — {fieldLabel}
        </span>
        {selection && (
          <button
            type="button"
            onClick={onClearSelection}
            className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] underline"
          >
            Change
          </button>
        )}
      </div>

      {selection && (
        <p className="text-xs rounded-md px-2 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {selection.mode === 'existing' ? (
            <>
              Using existing: <strong>{selection.label}</strong>
            </>
          ) : (
            <>
              Will create: <strong>{selection.label}</strong>
            </>
          )}
        </p>
      )}

      {listOpen && isSearching && (
        <p className="text-xs text-[var(--color-text-muted)]">Searching close matches…</p>
      )}

      {listOpen && !isSearching && !error && suggestions.length > 0 && (
        <p className="text-[10px] text-[var(--color-text-muted)]">
          {broadened
            ? 'Few exact matches — showing closest, then broader results.'
            : 'Closest matches to your input.'}
        </p>
      )}

      {listOpen && error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      {listOpen && !isSearching && !error && suggestions.length > 0 && (
        <div className="space-y-2">
          {closeSuggestions.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-[var(--color-text-secondary)] mb-1">
                Close matches
              </p>
              <ul className="space-y-1">
                {closeSuggestions.map((suggestion) => (
                  <SuggestionRow
                    key={suggestion.termId}
                    suggestion={suggestion}
                    onSelect={() => onSelectExisting(suggestion)}
                  />
                ))}
              </ul>
            </div>
          )}

          {broadened && otherSuggestions.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-[var(--color-text-muted)] mb-1">
                More results
              </p>
              <ul className="space-y-1">
                {otherSuggestions.map((suggestion) => (
                  <SuggestionRow
                    key={suggestion.termId}
                    suggestion={suggestion}
                    onSelect={() => onSelectExisting(suggestion)}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {listOpen && (
        <button
          type="button"
          onClick={onChooseCreate}
          className="focus-ring w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          Create new atom «{trimmed}»
        </button>
      )}

      {selection?.mode === 'existing' && (
        <button
          type="button"
          onClick={onChooseCreate}
          className="focus-ring w-full rounded-md px-2 py-1.5 text-left text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          Create new instead of «{selection.label}»
        </button>
      )}
    </div>
  );
}
