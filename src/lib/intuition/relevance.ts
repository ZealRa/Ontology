/** Minimum client-side score to show in primary (close) results. */
export const CLOSE_MATCH_SCORE = 50;

/** Minimum score when including broader `%query%` matches. */
export const BROAD_MATCH_SCORE = 25;

const WORD_CHAR = /[\p{L}\p{N}]/u;

function charBefore(label: string, index: number): string {
  return index > 0 ? label[index - 1]! : '';
}

function charAfter(label: string, index: number, queryLen: number): string {
  return index + queryLen < label.length ? label[index + queryLen]! : '';
}

function isWordBoundary(before: string, after: string): boolean {
  return !WORD_CHAR.test(before) && !WORD_CHAR.test(after);
}

/**
 * Higher = closer to the user input.
 * Penalizes buried substring hits in long labels (URLs, caip10, "gazette", etc.).
 */
export function relevanceScore(label: string, query: string): number {
  const normalizedLabel = label.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return 0;

  if (normalizedLabel === normalizedQuery) return 100;
  if (normalizedLabel.startsWith(normalizedQuery)) return 85;

  const words = normalizedLabel.split(/\s+/);
  if (words.some((word) => word.startsWith(normalizedQuery))) return 70;
  if (words.some((word) => word === normalizedQuery)) return 65;

  const idx = normalizedLabel.indexOf(normalizedQuery);
  if (idx === -1) return 0;

  const before = charBefore(normalizedLabel, idx);
  const after = charAfter(normalizedLabel, idx, normalizedQuery.length);
  const wholeToken =
    isWordBoundary(before, after) ||
    (isWordBoundary(before, '') && !WORD_CHAR.test(after)); // e.g. "ZetaChain"

  // Long labels: only reward word-aligned hits (not "zet" inside "gazette" / caip10)
  if (normalizedLabel.length > normalizedQuery.length * 6) {
    if (wholeToken) return 55;
    if (idx === 0) return 50;
    return 15;
  }

  if (wholeToken) return 50;
  return 40;
}

export function tripleRelevanceScore(
  triple: { subjectLabel: string; predicateLabel: string; objectLabel: string },
  query: string
): number {
  return Math.max(
    relevanceScore(triple.subjectLabel, query),
    relevanceScore(triple.predicateLabel, query),
    relevanceScore(triple.objectLabel, query)
  );
}
