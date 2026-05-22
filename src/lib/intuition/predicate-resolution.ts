import { PREDICATES } from '../../data/predicates';
import { conjugateForSelf, isSelfSubject } from '../conjugate';

export function getPredicateRule(predicateId: string) {
  return PREDICATES.find((p) => p.id === predicateId);
}

/** Canonical ontology label — used to search existing predicate atoms on-chain. */
export function predicateSearchQuery(predicateId: string): string {
  return getPredicateRule(predicateId)?.label ?? predicateId;
}

/** Default label when creating a new predicate atom (conjugated for Self subjects). */
export function defaultPredicateAtomLabel(
  predicateId: string,
  subjectType: string | null
): string {
  const pred = getPredicateRule(predicateId);
  if (!pred) return predicateId;
  return isSelfSubject(subjectType)
    ? conjugateForSelf(pred.id, pred.label)
    : pred.label;
}
