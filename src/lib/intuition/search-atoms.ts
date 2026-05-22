import { globalSearch } from '@0xintuition/sdk';

import type { AtomSuggestion } from './types';

const MIN_CLOSE_MATCHES = 3;
const MAX_SUGGESTIONS = 8;
const STRICT_FETCH_LIMIT = 20;
const BROAD_FETCH_LIMIT = 35;
const CLOSE_MATCH_SCORE = 50;

type ScoredSuggestion = AtomSuggestion & { score: number };

function atomDisplayLabel(atom: {
  label?: string | null;
  data?: string | null;
  value?: {
    thing?: { name?: string | null } | null;
    person?: { name?: string | null } | null;
    organization?: { name?: string | null } | null;
  } | null;
}): string {
  return (
    atom.label?.trim() ||
    atom.value?.thing?.name?.trim() ||
    atom.value?.person?.name?.trim() ||
    atom.value?.organization?.name?.trim() ||
    atom.data?.trim()?.slice(0, 80) ||
    'Unlabeled atom'
  );
}

/** Higher = closer to the user input. */
export function relevanceScore(label: string, query: string): number {
  const normalizedLabel = label.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return 0;

  if (normalizedLabel === normalizedQuery) return 100;
  if (normalizedLabel.startsWith(normalizedQuery)) return 85;

  const words = normalizedLabel.split(/\s+/);
  if (words.some((word) => word.startsWith(normalizedQuery))) return 70;
  if (words.some((word) => word === normalizedQuery)) return 65;

  if (normalizedLabel.includes(normalizedQuery)) return 45;

  return 0;
}

async function fetchAtomSuggestions(
  likeStr: string,
  limit: number
): Promise<AtomSuggestion[]> {
  const result = await globalSearch(likeStr, {
    atomsLimit: limit,
    accountsLimit: 0,
    triplesLimit: 0,
    collectionsLimit: 0,
  });

  if (!result?.atoms?.length) return [];

  return result.atoms
    .filter((atom) => atom.term_id?.startsWith('0x'))
    .map((atom) => ({
      termId: atom.term_id as `0x${string}`,
      label: atomDisplayLabel(atom),
    }));
}

function mergeSuggestions(
  target: Map<string, ScoredSuggestion>,
  incoming: AtomSuggestion[],
  tierBonus: number,
  query: string
) {
  for (const atom of incoming) {
    const score = relevanceScore(atom.label, query) + tierBonus;
    if (score <= 0) continue;

    const existing = target.get(atom.termId);
    if (!existing || score > existing.score) {
      target.set(atom.termId, { ...atom, score });
    }
  }
}

function countCloseMatches(scored: Map<string, ScoredSuggestion>, query: string): number {
  return [...scored.values()].filter(
    (entry) => relevanceScore(entry.label, query) >= CLOSE_MATCH_SCORE
  ).length;
}

export type AtomSearchResult = {
  suggestions: AtomSuggestion[];
  /** True when a broader `%query%` search was used to fill in results. */
  broadened: boolean;
};

/**
 * Tiered search: prefix / close matches first, then widen to contains if needed.
 */
export async function searchProtocolAtoms(query: string): Promise<AtomSearchResult> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { suggestions: [], broadened: false };
  }

  const scored = new Map<string, ScoredSuggestion>();

  // Tier 1 — narrow: starts with input
  const prefixResults = await fetchAtomSuggestions(`${trimmed}%`, STRICT_FETCH_LIMIT);
  mergeSuggestions(scored, prefixResults, 20, trimmed);

  let broadened = false;

  if (countCloseMatches(scored, trimmed) < MIN_CLOSE_MATCHES) {
    broadened = true;

    // Tier 2 — contains full phrase
    const phraseResults = await fetchAtomSuggestions(`%${trimmed}%`, BROAD_FETCH_LIMIT);
    mergeSuggestions(scored, phraseResults, 0, trimmed);

    // Tier 3 — first word prefix when input has several words
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length > 1 && words[0]) {
      const firstWordResults = await fetchAtomSuggestions(`${words[0]}%`, 15);
      mergeSuggestions(scored, firstWordResults, 8, trimmed);
    }
  }

  const suggestions = [...scored.values()]
    .filter((entry) => relevanceScore(entry.label, trimmed) >= 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)
    .map(({ termId, label }) => ({ termId, label }));

  return { suggestions, broadened: broadened && suggestions.length > 0 };
}
