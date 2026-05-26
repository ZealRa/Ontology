/**
 * Semantic groups for predicate clustering, in display order. Single source
 * of truth — UI layers sort against this tuple's index.
 */
export const PREDICATE_GROUPS = [
  'Identity & Trust',
  'Membership & Work',
  'Creation & Contribution',
  'Interests & Expertise',
  'Social & Endorsement',
  'Location & Events',
  'Commerce & Products',
  'Software & Tools',
  'Blockchain & Onchain',
  'Content & Media',
  'Taxonomy & Classification',
] as const;

export type PredicateSemanticGroup = (typeof PREDICATE_GROUPS)[number];

/**
 * Grammatical form of the predicate label. Documentary for now — lets the
 * glossary surface form variants and leaves the door open for form-aware
 * ranking in the predicate picker once multiple forms per concept exist in
 * the main PREDICATES list.
 *
 * - `bare`: imperative / bare infinitive — "trust", "follow", "like"
 * - `third-person-singular`: "trusts", "follows", "likes"
 * - `past`: "created", "authored", "attended"
 * - `phrase`: multi-word or be-verb forms — "is part of", "member of"
 * - `passive`: "backed by", "authored by", "acquired by"
 */
export type PredicateForm =
  | 'bare'
  | 'third-person-singular'
  | 'past'
  | 'phrase'
  | 'passive';

export interface PredicateRule {
  id: string;
  label: string;
  description: string;
  subjectTypes: string[];
  objectTypes: string[];
  /** Semantic group this predicate belongs to. */
  group: PredicateSemanticGroup;
  /** Sort priority within the group (lower = first). */
  priority: number;
  /** Grammatical form of the label. */
  form: PredicateForm;
}

/** Raw predicate definition minus the group/priority/form metadata. */
type PredicateDefinition = Omit<PredicateRule, 'group' | 'priority' | 'form'>;

/**
 * Per-predicate grammatical form. Keyed by predicate ID; defaults to
 * `third-person-singular` for predicates without an explicit entry (the most
 * common form in the current list).
 */
const PREDICATE_FORMS: Record<string, PredicateForm> = {
  // past tense
  created: 'past',
  reviewed: 'past',
  'attended event': 'past',
  'organized event': 'past',

  // passive
  'authored by': 'passive',
  'published by': 'passive',
  'created by': 'passive',
  'developed by': 'passive',
  'maintained by': 'passive',
  'acquired by': 'passive',
  'advised by': 'passive',
  'sold by': 'passive',
  'hosted by': 'passive',
  'owned by': 'passive',
  'controlled by': 'passive',

  // phrase / multi-word
  'member of': 'phrase',
  'founder of': 'phrase',
  'works at': 'phrase',
  'contributor to': 'phrase',
  'interested in': 'phrase',
  'expert in': 'phrase',
  'located in': 'phrase',
  'headquartered in': 'phrase',
  'part of': 'phrase',
  'is a': 'phrase',
  'tagged with': 'phrase',
  'alternative to': 'phrase',
  'review of': 'phrase',
  'reply to': 'phrase',
  'brand of': 'phrase',
  'token of': 'phrase',
  'deployed on': 'phrase',
  'sub concept of': 'phrase',
  'opposite of': 'phrase',
  'related to': 'phrase',
  'partners with': 'phrase',
  'competitor of': 'phrase',
  'depends on': 'phrase',
  'fork of': 'phrase',
  about: 'phrase',
  // Everything else defaults to 'third-person-singular'.
};

/** All subject type IDs that represent "software" broadly */
const SOFTWARE_TYPES = ['SoftwareSourceCode', 'SoftwareApplication', 'MobileApplication'];
/** All creative work type IDs */
const CREATIVE_WORK_TYPES = ['Article', 'NewsArticle', 'Book', 'Movie', 'TVSeries', 'MusicRecording', 'MusicAlbum', 'PodcastSeries', 'PodcastEpisode'];
/** All organization-like type IDs */
const ORG_TYPES = ['Organization', 'LocalBusiness', 'Brand'];
/** Intuition protocol account + human identity (subjects/objects in social claims) */
const IDENTITY_ACTOR_TYPES = ['Person', 'Account'];

/**
 * Per-predicate semantic group and within-group priority.
 * Keyed by predicate ID; consumed once at module init to build PREDICATES.
 */
const PREDICATE_SEMANTICS: Record<string, { group: PredicateSemanticGroup; priority: number }> = {
  trusts: { group: 'Identity & Trust', priority: 1 },
  knows: { group: 'Identity & Trust', priority: 2 },
  follows: { group: 'Identity & Trust', priority: 3 },

  'founder of': { group: 'Membership & Work', priority: 1 },
  'member of': { group: 'Membership & Work', priority: 2 },
  'works at': { group: 'Membership & Work', priority: 3 },
  employs: { group: 'Membership & Work', priority: 4 },
  'advised by': { group: 'Membership & Work', priority: 5 },
  'partners with': { group: 'Membership & Work', priority: 6 },
  'acquired by': { group: 'Membership & Work', priority: 7 },

  created: { group: 'Creation & Contribution', priority: 1 },
  'contributor to': { group: 'Creation & Contribution', priority: 2 },
  develops: { group: 'Creation & Contribution', priority: 3 },
  maintains: { group: 'Creation & Contribution', priority: 4 },
  'created by': { group: 'Creation & Contribution', priority: 5 },
  'developed by': { group: 'Creation & Contribution', priority: 6 },
  'maintained by': { group: 'Creation & Contribution', priority: 7 },
  'authored by': { group: 'Creation & Contribution', priority: 8 },
  'published by': { group: 'Creation & Contribution', priority: 9 },

  'expert in': { group: 'Interests & Expertise', priority: 1 },
  'interested in': { group: 'Interests & Expertise', priority: 2 },
  advocates: { group: 'Interests & Expertise', priority: 3 },

  endorses: { group: 'Social & Endorsement', priority: 1 },
  recommends: { group: 'Social & Endorsement', priority: 2 },
  likes: { group: 'Social & Endorsement', priority: 3 },
  reviewed: { group: 'Social & Endorsement', priority: 4 },
  sponsors: { group: 'Social & Endorsement', priority: 5 },
  supports: { group: 'Social & Endorsement', priority: 6 },
  about: { group: 'Social & Endorsement', priority: 7 },
  'reply to': { group: 'Social & Endorsement', priority: 8 },
  'review of': { group: 'Social & Endorsement', priority: 9 },

  'located in': { group: 'Location & Events', priority: 1 },
  'headquartered in': { group: 'Location & Events', priority: 2 },
  'attended event': { group: 'Location & Events', priority: 3 },
  'organized event': { group: 'Location & Events', priority: 4 },

  offers: { group: 'Commerce & Products', priority: 1 },
  manufactures: { group: 'Commerce & Products', priority: 2 },
  uses: { group: 'Commerce & Products', priority: 3 },
  'brand of': { group: 'Commerce & Products', priority: 4 },
  'sold by': { group: 'Commerce & Products', priority: 5 },
  'competitor of': { group: 'Commerce & Products', priority: 6 },

  'depends on': { group: 'Software & Tools', priority: 1 },
  'alternative to': { group: 'Software & Tools', priority: 2 },
  'fork of': { group: 'Software & Tools', priority: 3 },
  implements: { group: 'Software & Tools', priority: 4 },
  'hosted by': { group: 'Software & Tools', priority: 5 },

  'owned by': { group: 'Blockchain & Onchain', priority: 1 },
  'controlled by': { group: 'Blockchain & Onchain', priority: 2 },
  'deployed on': { group: 'Blockchain & Onchain', priority: 3 },
  'token of': { group: 'Blockchain & Onchain', priority: 4 },

  'tagged with': { group: 'Content & Media', priority: 1 },
  'part of': { group: 'Content & Media', priority: 2 },

  'is a': { group: 'Taxonomy & Classification', priority: 1 },
  'related to': { group: 'Taxonomy & Classification', priority: 2 },
  'sub concept of': { group: 'Taxonomy & Classification', priority: 3 },
  'opposite of': { group: 'Taxonomy & Classification', priority: 4 },
};

/**
 * Predicate compatibility matrix — raw definitions.
 * Each predicate defines which subject types can use it and what object types are expected.
 * Types use atom type IDs from atom-types.ts.
 * @see https://github.com/0xIntuition/intuition-data-structures
 */
const PREDICATE_DEFINITIONS: PredicateDefinition[] = [
  // ─── Person → Person ──────────────────────────────────────
  { id: 'trusts', label: 'trusts', description: 'Subject places trust in object', subjectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES], objectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES, ...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'Product', 'Service', 'WebSite', 'DefinedTerm', 'Place', 'Event', 'EthereumAccount', 'EthereumSmartContract', 'EthereumERC20', 'Thing'] },
  { id: 'follows', label: 'follows', description: 'Subject follows or subscribes to object', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES, 'MusicGroup'] },
  { id: 'knows', label: 'knows', description: 'Subject has a personal connection with object', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: [...IDENTITY_ACTOR_TYPES] },
  { id: 'endorses', label: 'endorses', description: 'Subject endorses or vouches for object', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES, ...SOFTWARE_TYPES, 'Product', 'Service'] },
  { id: 'recommends', label: 'recommends', description: 'Subject recommends object to others', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES, ...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'Product', 'Service', 'Event', 'WebSite', 'Thing'] },

  // ─── Person → Organization ────────────────────────────────
  { id: 'member of', label: 'member of', description: 'Subject is a member of organization', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: [...ORG_TYPES, 'MusicGroup'] },
  { id: 'founder of', label: 'founder of', description: 'Subject founded the organization', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: [...ORG_TYPES] },
  { id: 'works at', label: 'works at', description: 'Subject is employed by organization', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: [...ORG_TYPES] },
  { id: 'contributor to', label: 'contributor to', description: 'Subject contributes to project or org', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: [...ORG_TYPES, ...SOFTWARE_TYPES, 'Dataset'] },

  // ─── Person → Abstract ────────────────────────────────────
  { id: 'interested in', label: 'interested in', description: 'Subject has interest in concept', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: ['DefinedTerm', 'Thing'] },
  { id: 'expert in', label: 'expert in', description: 'Subject has deep expertise in area', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: ['DefinedTerm', 'Thing'] },
  { id: 'advocates', label: 'advocates', description: 'Subject publicly supports concept', subjectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES], objectTypes: ['DefinedTerm', 'Thing'] },

  // ─── Person → Software/Thing ──────────────────────────────
  { id: 'uses', label: 'uses', description: 'Subject uses the software or tool', subjectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES], objectTypes: [...SOFTWARE_TYPES, 'Product', 'Service', 'Thing'] },
  { id: 'created', label: 'created', description: 'Subject created the object', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: [...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'ImageObject', 'VideoObject', 'Dataset', 'WebSite', 'Product', 'Thing'] },
  { id: 'likes', label: 'likes', description: 'Subject likes or favors object', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: ['Thing', ...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'MusicGroup', 'ImageObject', 'VideoObject', 'Product', 'Place', 'Event', 'WebSite', 'DefinedTerm'] },
  { id: 'reviewed', label: 'reviewed', description: 'Subject has reviewed object', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: ['Thing', ...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'Product', 'Service', 'Event'] },

  // ─── Person → Location ────────────────────────────────────
  { id: 'located in', label: 'located in', description: 'Entity is located in place', subjectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES, 'Event'], objectTypes: ['Place'] },

  // ─── Person → Event ───────────────────────────────────────
  { id: 'attended event', label: 'attended event', description: 'Subject attended an event', subjectTypes: [...IDENTITY_ACTOR_TYPES], objectTypes: ['Event'] },
  { id: 'organized event', label: 'organized event', description: 'Subject organized an event', subjectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES], objectTypes: ['Event'] },

  // ─── Organization → Person ────────────────────────────────
  { id: 'employs', label: 'employs', description: 'Organization employs person', subjectTypes: [...ORG_TYPES], objectTypes: [...IDENTITY_ACTOR_TYPES] },
  { id: 'advised by', label: 'advised by', description: 'Organization is advised by person', subjectTypes: [...ORG_TYPES], objectTypes: [...IDENTITY_ACTOR_TYPES] },

  // ─── Organization → Organization ──────────────────────────
  { id: 'partners with', label: 'partners with', description: 'Organization partners with another', subjectTypes: [...ORG_TYPES], objectTypes: [...ORG_TYPES] },
  { id: 'acquired by', label: 'acquired by', description: 'Organization was acquired by another', subjectTypes: [...ORG_TYPES], objectTypes: [...ORG_TYPES] },
  { id: 'sponsors', label: 'sponsors', description: 'Organization sponsors the object', subjectTypes: [...ORG_TYPES, ...IDENTITY_ACTOR_TYPES], objectTypes: [...ORG_TYPES, ...SOFTWARE_TYPES, ...IDENTITY_ACTOR_TYPES, 'Event'] },
  { id: 'competitor of', label: 'competitor of', description: 'Organization competes with another', subjectTypes: [...ORG_TYPES], objectTypes: [...ORG_TYPES] },

  // ─── Organization → Software/Place ────────────────────────
  { id: 'develops', label: 'develops', description: 'Organization develops software', subjectTypes: [...ORG_TYPES], objectTypes: [...SOFTWARE_TYPES] },
  { id: 'maintains', label: 'maintains', description: 'Organization maintains software', subjectTypes: [...ORG_TYPES], objectTypes: [...SOFTWARE_TYPES] },
  { id: 'headquartered in', label: 'headquartered in', description: 'Organization HQ is in place', subjectTypes: [...ORG_TYPES], objectTypes: ['Place'] },

  // ─── Organization → Abstract ──────────────────────────────
  { id: 'supports', label: 'supports', description: 'Organization supports concept or initiative', subjectTypes: [...ORG_TYPES], objectTypes: ['DefinedTerm', ...ORG_TYPES, ...IDENTITY_ACTOR_TYPES, 'Thing'] },

  // ─── Organization → Commerce ──────────────────────────────
  { id: 'offers', label: 'offers', description: 'Organization offers product or service', subjectTypes: [...ORG_TYPES], objectTypes: ['Product', 'Service'] },
  { id: 'manufactures', label: 'manufactures', description: 'Organization manufactures product', subjectTypes: [...ORG_TYPES], objectTypes: ['Product'] },

  // ─── Software → * ─────────────────────────────────────────
  { id: 'created by', label: 'created by', description: 'Software was created by person or org', subjectTypes: [...SOFTWARE_TYPES], objectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES] },
  { id: 'developed by', label: 'developed by', description: 'Software is developed by org', subjectTypes: [...SOFTWARE_TYPES], objectTypes: [...ORG_TYPES] },
  { id: 'maintained by', label: 'maintained by', description: 'Software is maintained by org or person', subjectTypes: [...SOFTWARE_TYPES], objectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES] },
  { id: 'tagged with', label: 'tagged with', description: 'Entity is tagged with concept or label', subjectTypes: [...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'ImageObject', 'VideoObject', 'Dataset', 'Product', 'Event', 'Thing'], objectTypes: ['DefinedTerm', 'Thing'] },
  { id: 'implements', label: 'implements', description: 'Software implements concept or standard', subjectTypes: [...SOFTWARE_TYPES], objectTypes: ['DefinedTerm'] },
  { id: 'depends on', label: 'depends on', description: 'Software depends on another', subjectTypes: [...SOFTWARE_TYPES], objectTypes: [...SOFTWARE_TYPES] },
  { id: 'alternative to', label: 'alternative to', description: 'Software is alternative to another', subjectTypes: [...SOFTWARE_TYPES], objectTypes: [...SOFTWARE_TYPES] },
  { id: 'fork of', label: 'fork of', description: 'Software is a fork of another', subjectTypes: ['SoftwareSourceCode'], objectTypes: ['SoftwareSourceCode'] },

  // ─── Blockchain → * ───────────────────────────────────────
  { id: 'owned by', label: 'owned by', description: 'Account or contract is owned by entity', subjectTypes: ['EthereumAccount', 'Account', 'EthereumSmartContract', 'EthereumERC20'], objectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES] },
  { id: 'controlled by', label: 'controlled by', description: 'Account is controlled by person', subjectTypes: ['EthereumAccount', 'Account'], objectTypes: [...IDENTITY_ACTOR_TYPES] },
  { id: 'deployed on', label: 'deployed on', description: 'Contract deployed on chain', subjectTypes: ['EthereumSmartContract', 'EthereumERC20'], objectTypes: ['Thing'] },
  { id: 'token of', label: 'token of', description: 'Token belongs to a project or protocol', subjectTypes: ['EthereumERC20'], objectTypes: [...ORG_TYPES, ...SOFTWARE_TYPES, 'Thing'] },

  // ─── Creative Work → * ────────────────────────────────────
  { id: 'authored by', label: 'authored by', description: 'Work was authored/created by', subjectTypes: [...CREATIVE_WORK_TYPES], objectTypes: [...IDENTITY_ACTOR_TYPES] },
  { id: 'published by', label: 'published by', description: 'Work was published by', subjectTypes: [...CREATIVE_WORK_TYPES, 'WebSite'], objectTypes: [...ORG_TYPES, ...IDENTITY_ACTOR_TYPES] },
  { id: 'about', label: 'about', description: 'Work is about this topic', subjectTypes: [...CREATIVE_WORK_TYPES, 'SocialMediaPosting', 'Comment', 'Review', 'PodcastEpisode'], objectTypes: [...IDENTITY_ACTOR_TYPES, ...ORG_TYPES, ...SOFTWARE_TYPES, 'DefinedTerm', 'Event', 'Product', 'Thing'] },

  // ─── Social → * ───────────────────────────────────────────
  { id: 'reply to', label: 'reply to', description: 'Post or comment is a reply to another', subjectTypes: ['Comment', 'SocialMediaPosting'], objectTypes: ['SocialMediaPosting', 'Comment', 'Article', 'Thing'] },
  { id: 'review of', label: 'review of', description: 'Review targets this entity', subjectTypes: ['Review'], objectTypes: ['Product', 'Service', ...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'Event', ...ORG_TYPES, 'Thing'] },

  // ─── Commerce → * ─────────────────────────────────────────
  { id: 'brand of', label: 'brand of', description: 'Brand belongs to product or org', subjectTypes: ['Brand'], objectTypes: ['Product', ...ORG_TYPES] },
  { id: 'sold by', label: 'sold by', description: 'Product or service is sold by', subjectTypes: ['Product', 'Service'], objectTypes: [...ORG_TYPES] },

  // ─── Web → * ──────────────────────────────────────────────
  { id: 'hosted by', label: 'hosted by', description: 'Website or page hosted by org', subjectTypes: ['WebSite', 'WebPage'], objectTypes: [...ORG_TYPES, ...IDENTITY_ACTOR_TYPES] },

  // ─── DefinedTerm → * ──────────────────────────────────────
  { id: 'related to', label: 'related to', description: 'Entity is related to another', subjectTypes: ['DefinedTerm', 'Thing'], objectTypes: ['DefinedTerm', 'Thing'] },
  { id: 'sub concept of', label: 'sub concept of', description: 'Term is a sub-concept of another', subjectTypes: ['DefinedTerm'], objectTypes: ['DefinedTerm'] },
  { id: 'opposite of', label: 'opposite of', description: 'Term is opposite to another', subjectTypes: ['DefinedTerm'], objectTypes: ['DefinedTerm'] },

  // ─── Generic ──────────────────────────────────────────────
  { id: 'is a', label: 'is a', description: 'Entity is an instance of type/concept', subjectTypes: ['Thing', ...IDENTITY_ACTOR_TYPES, ...ORG_TYPES, ...SOFTWARE_TYPES, 'Product', 'Service'], objectTypes: ['DefinedTerm', 'Thing'] },
  { id: 'part of', label: 'part of', description: 'Entity is part of larger entity', subjectTypes: ['Thing', ...IDENTITY_ACTOR_TYPES, 'WebPage', 'MusicRecording', 'PodcastEpisode', 'Article'], objectTypes: ['Thing', ...ORG_TYPES, 'MusicAlbum', 'PodcastSeries', 'Book', 'WebSite'] },
];

/** Fallback for any future definitions missing from PREDICATE_SEMANTICS. */
const DEFAULT_SEMANTICS = { group: PREDICATE_GROUPS[0], priority: 999 } as const;

/**
 * Final predicate list consumed by the app.
 *
 * Built in two passes:
 *   1. Attach semantic group + priority from PREDICATE_SEMANTICS (or fallback).
 *   2. Anywhere a predicate accepts `Person` as a subject, also accept `Self`
 *      — the first-person deictic atom. Derived rather than hand-maintained
 *      so any new Person-compatible predicate added later automatically
 *      works with `I`.
 */
export const PREDICATES: PredicateRule[] = PREDICATE_DEFINITIONS.map((def) => {
  const semantics = PREDICATE_SEMANTICS[def.id] ?? DEFAULT_SEMANTICS;
  const form = PREDICATE_FORMS[def.id] ?? 'third-person-singular';
  const subjectTypes =
    def.subjectTypes.includes('Person') && !def.subjectTypes.includes('Self')
      ? [...def.subjectTypes, 'Self']
      : def.subjectTypes;
  // Account is explicit in IDENTITY_ACTOR_TYPES; Self still derived from Person rules.
  return {
    ...def,
    subjectTypes,
    group: semantics.group,
    priority: semantics.priority,
    form,
  };
});

/**
 * Returns predicates compatible with the given subject type.
 */
export function getPredicatesForSubject(subjectTypeId: string): PredicateRule[] {
  return PREDICATES.filter((p) => p.subjectTypes.includes(subjectTypeId));
}

/**
 * Returns expected object types for a given predicate.
 */
export function getObjectTypesForPredicate(predicateId: string): string[] {
  const predicate = PREDICATES.find((p) => p.id === predicateId);
  return predicate?.objectTypes ?? [];
}

/**
 * Validates a claim's type compatibility.
 */
export function validateClaim(
  subjectTypeId: string,
  predicateId: string,
  objectTypeId: string
): { valid: boolean; reason?: string } {
  const predicate = PREDICATES.find((p) => p.id === predicateId);
  if (!predicate) return { valid: false, reason: `Unknown predicate: ${predicateId}` };
  if (!predicate.subjectTypes.includes(subjectTypeId)) {
    return { valid: false, reason: `"${predicate.label}" cannot be used with ${subjectTypeId} subjects` };
  }
  if (!predicate.objectTypes.includes(objectTypeId)) {
    return { valid: false, reason: `"${predicate.label}" expects object of type: ${predicate.objectTypes.join(', ')}` };
  }
  return { valid: true };
}
