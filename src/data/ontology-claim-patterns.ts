import { ATOM_TYPES } from './atom-types';
import { PREDICATES } from './predicates';

/** Ontology-level claim pattern — types, not named instances. */
export type OntologyClaimPattern = {
  id: string;
  subjectTypeId: string;
  predicateId: string;
  objectTypeId: string;
  summary: string;
};

export function getAtomTypeLabel(typeId: string): string {
  return ATOM_TYPES.find((t) => t.id === typeId)?.label ?? typeId;
}

export function getPredicateLabel(predicateId: string): string {
  return PREDICATES.find((p) => p.id === predicateId)?.label ?? predicateId;
}

export function formatOntologyPatternLine(pattern: OntologyClaimPattern): string {
  return `${getAtomTypeLabel(pattern.subjectTypeId)} — ${getPredicateLabel(pattern.predicateId)} — ${getAtomTypeLabel(pattern.objectTypeId)}`;
}

/** Canonical patterns to anchor on-chain — vocabulary, not facts about Marco or Polo. */
export const ONTOLOGY_CLAIM_PATTERNS: OntologyClaimPattern[] = [
  {
    id: 'person-follows-person',
    subjectTypeId: 'Person',
    predicateId: 'follows',
    objectTypeId: 'Person',
    summary: 'Social graph rule between people (type-level).',
  },
  {
    id: 'person-member-of-org',
    subjectTypeId: 'Person',
    predicateId: 'member of',
    objectTypeId: 'Organization',
    summary: 'Membership between a person type and an organization type.',
  },
  {
    id: 'thing-is-a-term',
    subjectTypeId: 'Thing',
    predicateId: 'is a',
    objectTypeId: 'DefinedTerm',
    summary: 'Classification: instances of Thing as instances of a concept.',
  },
];

export const ONTOLOGY_INSTANCE_ANTI_PATTERN = {
  title: 'Instance claim (avoid here)',
  line: 'Marco — follows — Polo',
  detail:
    'Named entities are valid on Intuition, but Ontology targets reusable schema patterns (Person — follows — Person), not one-off social facts.',
};
