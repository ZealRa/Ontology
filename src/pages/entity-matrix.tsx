import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ClaimMatrix } from '../components/claim-matrix';
import { EntityTypeTagCloud } from '../components/entity-type-tag-cloud';
import {
  getSuggestedMatrixFilterTypeIds,
  MAX_MATRIX_FILTER_TYPES,
} from '../data/semantic-rankings';
import { useMatrixTypePairs } from '../lib/intuition/use-matrix-type-pairs';
import { useClaimWorkspace } from '../lib/use-claim-workspace';

export function EntityMatrixPage() {
  const navigate = useNavigate();
  const { fillOntologyPattern } = useClaimWorkspace();
  const [selectedTypeIds, setSelectedTypeIds] = useState<Set<string>>(new Set());
  const [showTypeLimitMessage, setShowTypeLimitMessage] = useState(false);
  const { pairs, isLoading: isLoadingTypes, error: typesError } = useMatrixTypePairs();

  const suggestedTypeIds = useMemo(
    () => getSuggestedMatrixFilterTypeIds(pairs, selectedTypeIds),
    [pairs, selectedTypeIds]
  );

  useEffect(() => {
    setSelectedTypeIds((prev) => {
      if (prev.size === 0 || suggestedTypeIds.size === 0) return prev;
      const next = new Set([...prev].filter((id) => suggestedTypeIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [suggestedTypeIds]);

  const handleSelectClaim = useCallback(
    (subjectTypeId: string, predicateId: string, objectTypeId: string) => {
      fillOntologyPattern(subjectTypeId, predicateId, objectTypeId);
      navigate('/');
    },
    [fillOntologyPattern, navigate]
  );

  const handleToggleType = useCallback((typeId: string) => {
    setSelectedTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(typeId)) {
        next.delete(typeId);
        setShowTypeLimitMessage(false);
        return next;
      }
      if (next.size >= MAX_MATRIX_FILTER_TYPES) {
        setShowTypeLimitMessage(true);
        return prev;
      }
      setShowTypeLimitMessage(false);
      next.add(typeId);
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedTypeIds(new Set());
    setShowTypeLimitMessage(false);
  }, []);

  return (
    <main className="px-4 sm:px-6 py-8 space-y-6" data-tutorial-step="entity-matrix">
      {/* Tag cloud filter */}
      <EntityTypeTagCloud
        selectedTypeIds={selectedTypeIds}
        availableTypeIds={suggestedTypeIds}
        onToggleType={handleToggleType}
        onClearAll={handleClearAll}
        showTypeLimitMessage={showTypeLimitMessage}
        maxTypes={MAX_MATRIX_FILTER_TYPES}
        isLoading={isLoadingTypes}
        loadError={typesError}
      />

      {/* Matrix */}
      <ClaimMatrix
        filterTypeIds={selectedTypeIds}
        onSelectClaim={handleSelectClaim}
      />
    </main>
  );
}
