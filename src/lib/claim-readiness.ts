import { getObjectTypesForPredicate, PREDICATES } from '../data/predicates';
import { getPredicateRule } from './intuition/predicate-resolution';
import { isSelfSubject } from './conjugate';
import type { ProtocolAtomResolution } from './intuition/types';

/** Static reference mode enforces curated subject/predicate/object type rules. */
export function shouldEnforceCuratedClaimTypeRules(isStaticNetwork: boolean): boolean {
  return isStaticNetwork;
}

/** Whether subject + predicate + object types satisfy curated predicate rules. */
export function isClaimTypeCompatible(
  subjectType: string,
  predicateId: string,
  objectType: string,
  enforceCuratedRules: boolean
): { valid: boolean; message?: string } {
  if (!enforceCuratedRules) return { valid: true };

  const predicate = getPredicateRule(predicateId);
  if (!predicate) return { valid: true };

  if (!predicate.subjectTypes.includes(subjectType)) {
    return {
      valid: false,
      message: `"${predicate.label}" doesn't work with ${subjectType} subjects`,
    };
  }
  if (!predicate.objectTypes.includes(objectType)) {
    return {
      valid: false,
      message: `"${predicate.label}" expects: ${predicate.objectTypes.join(', ')}`,
    };
  }
  return { valid: true };
}

export function resolveSubjectDisplayLabel(
  subject: string,
  subjectType: string | null,
  subjectAtom: ProtocolAtomResolution | null
): string {
  if (subjectAtom?.label) return subjectAtom.label;
  if (isSelfSubject(subjectType)) return 'I';
  return subject.trim();
}

export function resolveObjectDisplayLabel(
  object: string,
  objectAtom: ProtocolAtomResolution | null
): string {
  return objectAtom?.label ?? object.trim();
}

export type ClaimFormState = {
  subject: string;
  subjectType: string | null;
  predicateId: string | null;
  object: string;
  objectType: string | null;
  subjectAtom: ProtocolAtomResolution | null;
};

/** True when every field needed to build or submit a claim is filled. */
export function isClaimStructurallyComplete(input: ClaimFormState): boolean {
  return getClaimBlockers(input).length === 0;
}

/** Show save / submit controls once the claim sentence is filled in (types may still be missing). */
export function canShowClaimActions(input: ClaimFormState): boolean {
  if (!input.subjectType || !input.predicateId?.trim() || !input.object.trim()) {
    return false;
  }

  const subjectLabel = resolveSubjectDisplayLabel(
    input.subject,
    input.subjectType,
    input.subjectAtom
  );
  if (!subjectLabel) return false;

  if (!isSelfSubject(input.subjectType) && !input.subject.trim()) {
    return false;
  }

  return true;
}

/** Human-readable reasons on-chain submit is not ready yet. */
export function getClaimBlockers(input: ClaimFormState): string[] {
  const blockers: string[] = [];

  if (!input.subjectType) {
    blockers.push('Select a subject type.');
  }

  if (!input.predicateId?.trim()) {
    blockers.push('Enter or select a predicate.');
  }

  const subjectLabel = resolveSubjectDisplayLabel(
    input.subject,
    input.subjectType,
    input.subjectAtom
  );
  if (!subjectLabel) {
    blockers.push('Enter a subject.');
  } else if (!isSelfSubject(input.subjectType) && !input.subject.trim()) {
    blockers.push('Enter a subject.');
  }

  if (!input.object.trim()) {
    blockers.push('Enter an object.');
  }

  if (!input.objectType) {
    blockers.push('Choose an object type (under the object field).');
  }

  return blockers;
}

/** Subject field is far enough along to search / resolve on-chain atoms. */
export function canResolveSubjectAtoms(
  subject: string,
  subjectType: string | null
): boolean {
  return subjectType !== null && (isSelfSubject(subjectType) || subject.trim().length > 0);
}

/** Query string passed to on-chain atom search for the subject column. */
export function subjectAtomSearchQuery(
  subject: string,
  subjectType: string | null
): string {
  if (isSelfSubject(subjectType)) {
    return subject.trim() || 'I';
  }
  return subject;
}

/** Auto-pick object type when the predicate allows only one (static reference mode only). */
export function soleObjectTypeForPredicate(
  predicateId: string | null,
  enforceCuratedRules: boolean
): string | null {
  if (!enforceCuratedRules || !predicateId) return null;
  const types = getObjectTypesForPredicate(predicateId);
  return types.length === 1 ? types[0]! : null;
}

/** Predicate suggestions for the claim builder subject type. */
export function predicatesForClaimBuilder(
  subjectTypeId: string | null,
  enforceCuratedRules: boolean
) {
  if (!enforceCuratedRules || !subjectTypeId) return PREDICATES;
  return PREDICATES.filter((p) => p.subjectTypes.includes(subjectTypeId));
}
