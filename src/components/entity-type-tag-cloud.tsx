import { useMemo } from 'react';
import { ATOM_TYPES, ATOM_CATEGORIES, type AtomCategory } from '../data/atom-types';
import { MAX_MATRIX_FILTER_TYPES } from '../data/semantic-rankings';

interface EntityTypeTagCloudProps {
  selectedTypeIds: Set<string>;
  /** Types that appear in the current matrix (and compatible partners when one is selected). */
  availableTypeIds: Set<string>;
  onToggleType: (typeId: string) => void;
  onClearAll: () => void;
  showTypeLimitMessage?: boolean;
  maxTypes?: number;
  isLoading?: boolean;
  loadError?: string | null;
}

export function EntityTypeTagCloud({
  selectedTypeIds,
  availableTypeIds,
  onToggleType,
  onClearAll,
  showTypeLimitMessage = false,
  maxTypes = MAX_MATRIX_FILTER_TYPES,
  isLoading = false,
  loadError = null,
}: EntityTypeTagCloudProps) {
  const hasSelection = selectedTypeIds.size > 0;
  const atTypeLimit = selectedTypeIds.size >= maxTypes;
  const oneSelected = selectedTypeIds.size === 1;

  const grouped = useMemo(() => {
    const groups: {
      category: AtomCategory;
      label: string;
      color: string;
      types: { id: string; label: string }[];
    }[] = [];

    for (const [cat, meta] of Object.entries(ATOM_CATEGORIES)) {
      const types = ATOM_TYPES.filter(
        (t) =>
          t.category === cat &&
          (availableTypeIds.has(t.id) || selectedTypeIds.has(t.id))
      ).map((t) => ({ id: t.id, label: t.label }));

      if (types.length > 0) {
        groups.push({ category: cat as AtomCategory, label: meta.label, color: meta.color, types });
      }
    }

    return groups;
  }, [availableTypeIds, selectedTypeIds]);

  const totalTags = grouped.reduce((n, g) => n + g.types.length, 0);
  const funnelMode = selectedTypeIds.size === maxTypes;

  return (
    <div className="space-y-2">
      {isLoading && (
        <p className="text-xs text-[var(--color-text-muted)]">Loading types from ontology…</p>
      )}
      {loadError && (
        <p className="text-xs text-red-400" role="alert">
          {loadError}
        </p>
      )}
      {!isLoading && !loadError && totalTags === 0 && (
        <p className="text-xs text-[var(--color-text-muted)]">
          No entity types in the ontology matrix on this network yet.
        </p>
      )}
      {oneSelected && totalTags > 0 && (
        <p className="text-xs text-[var(--color-text-muted)]">
          Pick a second type — only types with an existing slot with your first choice are shown.
        </p>
      )}
      {funnelMode && (
        <p className="text-xs text-[var(--color-text-muted)]">
          Funnel: only slots that use both selected types as subject and object.
        </p>
      )}
      {showTypeLimitMessage && (
        <p className="text-xs text-amber-400" role="status">
          You can&apos;t pick more than {maxTypes} types. Deselect one to choose another.
        </p>
      )}
      {totalTags > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {hasSelection && (
            <button
              type="button"
              onClick={onClearAll}
              className="focus-ring h-7 inline-flex items-center rounded-md px-3 text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              Clear all
            </button>
          )}
          <div className="flex flex-wrap gap-1.5">
            {grouped.map((group) =>
              group.types.map((type) => {
                const isActive = selectedTypeIds.has(type.id);
                const isDisabled = atTypeLimit && !isActive;
                const isDimmed = hasSelection && !isActive;

                return (
                  <button
                    key={type.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onToggleType(type.id)}
                    className={`focus-ring inline-flex items-center rounded-md text-xs font-medium px-2 py-1 transition-all ${
                      isDisabled
                        ? 'cursor-not-allowed opacity-25'
                        : isDimmed
                          ? 'cursor-pointer opacity-30 hover:opacity-60'
                          : 'cursor-pointer hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: isActive ? `${group.color}30` : `${group.color}10`,
                      color: group.color,
                      border: `1px solid ${isActive ? `${group.color}60` : `${group.color}25`}`,
                    }}
                    aria-disabled={isDisabled}
                  >
                    {type.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
