import { globalSearch } from '@0xintuition/sdk';
import {
  fetcher,
  GetTriplesDocument,
  type GetTriplesQuery,
} from '@0xintuition/graphql';

import { atomDisplayLabel } from './protocol-labels';
import {
  BROAD_MATCH_SCORE,
  CLOSE_MATCH_SCORE,
  relevanceScore,
  tripleRelevanceScore,
} from './relevance';
import type { AtomSuggestion } from './types';

export type ProtocolSearchTriple = {
  termId: `0x${string}`;
  subjectLabel: string;
  subjectTermId?: `0x${string}`;
  predicateLabel: string;
  predicateTermId?: `0x${string}`;
  objectLabel: string;
  objectTermId?: `0x${string}`;
};

export type ProtocolSearchAtom = AtomSuggestion & {
  /** GraphQL atom type, e.g. Thing, TextObject, Person. */
  atomType?: string | null;
  /** Client-side relevance score for sorting (not from API). */
  score: number;
};

export type ProtocolGlobalSearchResult = {
  /** High-confidence matches (exact, prefix, word). */
  atoms: ProtocolSearchAtom[];
  triples: ProtocolSearchTriple[];
  /** Lower-confidence matches from a broader `%query%` search, if any. */
  broadAtoms: ProtocolSearchAtom[];
  broadTriples: ProtocolSearchTriple[];
  /** True when broader matches were fetched because close matches were sparse. */
  broadened: boolean;
};

export type ProtocolGlobalSearchOptions = {
  atomsLimit?: number;
  triplesLimit?: number;
};

const MIN_CLOSE_ATOMS = 3;
const MIN_CLOSE_TRIPLES = 2;
const PREFIX_ATOM_LIMIT = 80;
const PREFIX_TRIPLE_LIMIT = 40;
const BROAD_ATOM_LIMIT = 120;
const BROAD_TRIPLE_LIMIT = 60;
const DIRECT_ATOM_LIMIT = 120;
const DIRECT_TRIPLE_LIMIT = 80;

type ScoredAtom = ProtocolSearchAtom;
type ScoredTriple = ProtocolSearchTriple & { score: number };

type DirectAtomSearchResult = {
  atoms?: Array<{
    term_id?: string | null;
    label?: string | null;
    data?: string | null;
    type?: string | null;
  }>;
};

const SearchAtomsDocument = `
  query SearchAtoms($where: atoms_bool_exp = {}, $limit: Int = 100) {
    atoms(where: $where, limit: $limit) {
      term_id
      label
      data
      type
    }
  }
`;

function isValidTermId(value: string | null | undefined): value is `0x${string}` {
  return typeof value === 'string' && value.startsWith('0x');
}

function looksLikeTermIdQuery(value: string): boolean {
  return /^0x[0-9a-fA-F]{4,}$/.test(value.trim());
}

function mapAtom(
  atom: Parameters<typeof atomDisplayLabel>[0] & { term_id?: string | null; type?: string | null },
  query: string,
  tierBonus: number
): ScoredAtom | null {
  if (!isValidTermId(atom.term_id)) return null;
  const label = atomDisplayLabel(atom);
  const score = relevanceScore(label, query) + tierBonus;
  if (score < BROAD_MATCH_SCORE) return null;
  return {
    termId: atom.term_id,
    label,
    atomType: atom.type ?? null,
    score,
  };
}

function mapTriple(
  triple: {
    term_id?: string | null;
    subject?: { label?: string | null; term_id?: string | null } | null;
    predicate?: { label?: string | null; term_id?: string | null } | null;
    object?: { label?: string | null; term_id?: string | null } | null;
  },
  query: string,
  tierBonus: number
): ScoredTriple | null {
  if (!isValidTermId(triple.term_id)) return null;

  const mapped: ProtocolSearchTriple = {
    termId: triple.term_id,
    subjectLabel: triple.subject?.label?.trim() || '—',
    subjectTermId: isValidTermId(triple.subject?.term_id) ? triple.subject.term_id : undefined,
    predicateLabel: triple.predicate?.label?.trim() || '—',
    predicateTermId: isValidTermId(triple.predicate?.term_id)
      ? triple.predicate.term_id
      : undefined,
    objectLabel: triple.object?.label?.trim() || '—',
    objectTermId: isValidTermId(triple.object?.term_id) ? triple.object.term_id : undefined,
  };

  const score = tripleRelevanceScore(mapped, query) + tierBonus;
  if (score < BROAD_MATCH_SCORE) return null;

  return { ...mapped, score };
}

async function fetchGlobal(
  likeStr: string,
  atomsLimit: number,
  triplesLimit: number
) {
  return globalSearch(likeStr, {
    atomsLimit,
    accountsLimit: 0,
    triplesLimit,
    collectionsLimit: 0,
  });
}

async function fetchDirectAtoms(query: string) {
  const trimmed = query.trim();
  const where = looksLikeTermIdQuery(trimmed)
    ? { term_id: { _ilike: `${trimmed}%` } }
    : {
        _or: [
          { label: { _ilike: `%${trimmed}%` } },
          { data: { _ilike: `%${trimmed}%` } },
        ],
      };

  return (await fetcher(SearchAtomsDocument, {
    where,
    limit: DIRECT_ATOM_LIMIT,
  })()) as DirectAtomSearchResult;
}

async function fetchDirectTriples(query: string) {
  const trimmed = query.trim();
  const where = looksLikeTermIdQuery(trimmed)
    ? {
        _or: [
          { term_id: { _ilike: `${trimmed}%` } },
          { subject_id: { _ilike: `${trimmed}%` } },
          { predicate_id: { _ilike: `${trimmed}%` } },
          { object_id: { _ilike: `${trimmed}%` } },
        ],
      }
    : {
        _or: [
          { subject: { label: { _ilike: `%${trimmed}%` } } },
          { subject: { data: { _ilike: `%${trimmed}%` } } },
          { predicate: { label: { _ilike: `%${trimmed}%` } } },
          { predicate: { data: { _ilike: `%${trimmed}%` } } },
          { object: { label: { _ilike: `%${trimmed}%` } } },
          { object: { data: { _ilike: `%${trimmed}%` } } },
        ],
      };

  return (await fetcher(GetTriplesDocument, {
    where,
    limit: DIRECT_TRIPLE_LIMIT,
  })()) as GetTriplesQuery;
}

function mergeAtoms(target: Map<string, ScoredAtom>, incoming: ScoredAtom[]) {
  for (const atom of incoming) {
    const existing = target.get(atom.termId);
    if (!existing || atom.score > existing.score) {
      target.set(atom.termId, atom);
    }
  }
}

function mergeTriples(target: Map<string, ScoredTriple>, incoming: ScoredTriple[]) {
  for (const triple of incoming) {
    const existing = target.get(triple.termId);
    if (!existing || triple.score > existing.score) {
      target.set(triple.termId, triple);
    }
  }
}

function countCloseAtoms(atoms: Map<string, ScoredAtom>, query: string): number {
  return [...atoms.values()].filter(
    (a) => relevanceScore(a.label, query) >= CLOSE_MATCH_SCORE
  ).length;
}

function partitionResults(
  atoms: Map<string, ScoredAtom>,
  triples: Map<string, ScoredTriple>,
  maxAtoms: number,
  maxTriples: number
): Pick<ProtocolGlobalSearchResult, 'atoms' | 'triples' | 'broadAtoms' | 'broadTriples'> {
  const sortedAtoms = [...atoms.values()].sort((a, b) => b.score - a.score);
  const sortedTriples = [...triples.values()].sort((a, b) => b.score - a.score);

  const closeAtoms: ProtocolSearchAtom[] = [];
  const broadAtoms: ProtocolSearchAtom[] = [];
  for (const atom of sortedAtoms) {
    const bucket = atom.score >= CLOSE_MATCH_SCORE ? closeAtoms : broadAtoms;
    if (bucket.length < maxAtoms) bucket.push(atom);
  }

  const closeTriples: ProtocolSearchTriple[] = [];
  const broadTriples: ProtocolSearchTriple[] = [];
  for (const { score, ...triple } of sortedTriples) {
    const bucket = score >= CLOSE_MATCH_SCORE ? closeTriples : broadTriples;
    if (bucket.length < maxTriples) bucket.push(triple);
  }

  return {
    atoms: closeAtoms,
    triples: closeTriples,
    broadAtoms,
    broadTriples,
  };
}

/**
 * Tiered search: prefix (`query%`) first, then `%query%` only if close matches are sparse.
 * Results are ranked by client-side relevance so exact hits like «Zet» appear first.
 * @see https://www.docs.intuition.systems/docs/intuition-sdk/search-guide
 */
export async function searchProtocolGlobal(
  query: string,
  {
    atomsLimit = 25,
    triplesLimit = 15,
  }: ProtocolGlobalSearchOptions = {}
): Promise<ProtocolGlobalSearchResult> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return {
      atoms: [],
      triples: [],
      broadAtoms: [],
      broadTriples: [],
      broadened: false,
    };
  }

  const atoms = new Map<string, ScoredAtom>();
  const triples = new Map<string, ScoredTriple>();

  const prefixResult = await fetchGlobal(
    `${trimmed}%`,
    PREFIX_ATOM_LIMIT,
    PREFIX_TRIPLE_LIMIT
  );
  if (prefixResult) {
    for (const atom of prefixResult.atoms ?? []) {
      const mapped = mapAtom(atom, trimmed, 20);
      if (mapped) mergeAtoms(atoms, [mapped]);
    }
    for (const triple of prefixResult.triples ?? []) {
      const mapped = mapTriple(triple, trimmed, 20);
      if (mapped) mergeTriples(triples, [mapped]);
    }
  }

  const [directAtoms, directTriples] = await Promise.all([
    fetchDirectAtoms(trimmed),
    fetchDirectTriples(trimmed),
  ]);

  for (const atom of directAtoms.atoms ?? []) {
    const mapped = mapAtom(atom, trimmed, looksLikeTermIdQuery(trimmed) ? 60 : 10);
    if (mapped) mergeAtoms(atoms, [mapped]);
  }
  for (const triple of directTriples.triples ?? []) {
    const mapped = mapTriple(triple, trimmed, looksLikeTermIdQuery(trimmed) ? 60 : 10);
    if (mapped) mergeTriples(triples, [mapped]);
  }

  const closeAtoms = countCloseAtoms(atoms, trimmed);
  const closeTriples = [...triples.values()].filter(
    (t) => tripleRelevanceScore(t, trimmed) >= CLOSE_MATCH_SCORE
  ).length;

  let broadened = false;

  if (closeAtoms < MIN_CLOSE_ATOMS || closeTriples < MIN_CLOSE_TRIPLES) {
    broadened = true;
    const broadResult = await fetchGlobal(
      `%${trimmed}%`,
      BROAD_ATOM_LIMIT,
      BROAD_TRIPLE_LIMIT
    );
    if (broadResult) {
      for (const atom of broadResult.atoms ?? []) {
        const mapped = mapAtom(atom, trimmed, 0);
        if (mapped) mergeAtoms(atoms, [mapped]);
      }
      for (const triple of broadResult.triples ?? []) {
        const mapped = mapTriple(triple, trimmed, 0);
        if (mapped) mergeTriples(triples, [mapped]);
      }
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length > 1 && words[0]) {
      const firstWordResult = await fetchGlobal(`${words[0]}%`, 15, 10);
      if (firstWordResult) {
        for (const atom of firstWordResult.atoms ?? []) {
          const mapped = mapAtom(atom, trimmed, 8);
          if (mapped) mergeAtoms(atoms, [mapped]);
        }
      }
    }
  }

  const partitioned = partitionResults(atoms, triples, atomsLimit, triplesLimit);

  return {
    ...partitioned,
    broadened: broadened && (partitioned.broadAtoms.length > 0 || partitioned.broadTriples.length > 0),
  };
}
