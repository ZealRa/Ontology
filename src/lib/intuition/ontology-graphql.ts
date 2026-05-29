import {
  fetcher,
  FindAtomIdsDocument,
  GetTriplesDocument,
  type GetTriplesQuery,
} from '@0xintuition/graphql';

export type IndexedTriple = GetTriplesQuery['triples'][number];

export async function findAtomsByLabel(
  label: string,
  limit = 10
): Promise<Array<{ term_id: string; label?: string | null }>> {
  const trimmed = label.trim();
  if (!trimmed) return [];

  const result = (await fetcher(FindAtomIdsDocument, {
    where: { label: { _eq: trimmed } },
    limit,
  })()) as { atoms?: Array<{ term_id: string; label?: string | null }> };

  return result.atoms ?? [];
}

export async function queryTriples(
  where: Record<string, unknown>,
  limit = 50
): Promise<IndexedTriple[]> {
  const result = (await fetcher(GetTriplesDocument, { where, limit })()) as GetTriplesQuery;
  return result.triples ?? [];
}
