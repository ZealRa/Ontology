import { getPredicatesForSubject, PREDICATES } from '../../data/predicates';
import type { PredicateRule } from '../../data/predicates';
import { conjugateForSelf, isSelfSubject } from '../conjugate';

export function getPredicateRule(predicateId: string) {
  return PREDICATES.find((p) => p.id === predicateId);
}

export function isKnownPredicateId(predicateId: string): boolean {
  return PREDICATES.some((p) => p.id === predicateId);
}

/** Match typed text to a curated predicate for this subject type, if any. */
export function matchPredicateForSubject(
  input: string,
  subjectType: string | null
): PredicateRule | undefined {
  const trimmed = input.trim();
  if (!trimmed || !subjectType) return undefined;

  const predicates = getPredicatesForSubject(subjectType);
  return predicates.find(
    (p) => p.id === trimmed || p.label.toLowerCase() === trimmed.toLowerCase()
  );
}

/** Resolve builder input to a predicate id (known id or custom label for on-chain). */
export function resolvePredicateIdFromInput(
  input: string,
  subjectType: string | null
): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  return matchPredicateForSubject(trimmed, subjectType)?.id ?? trimmed;
}

export function predicateDisplayLabel(predicateId: string): string {
  return getPredicateRule(predicateId)?.label ?? predicateId;
}

/** Canonical ontology label — used to search existing predicate atoms on-chain. */
export function predicateSearchQuery(predicateId: string): string {
  return predicateDisplayLabel(predicateId);
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
