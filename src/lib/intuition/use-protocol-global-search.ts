import { useEffect, useState } from 'react';

import { PROTOCOL_SEARCH_DEBOUNCE_MS } from '../timings';
import { useDebounce } from '../use-debounce';
import {
  searchProtocolGlobal,
  type ProtocolGlobalSearchOptions,
  type ProtocolGlobalSearchResult,
} from './search-protocol';

const EMPTY: ProtocolGlobalSearchResult = {
  atoms: [],
  triples: [],
  broadAtoms: [],
  broadTriples: [],
  broadened: false,
};

export function useProtocolGlobalSearch(
  query: string,
  enabled: boolean,
  options?: ProtocolGlobalSearchOptions
) {
  const debouncedQuery = useDebounce(query, PROTOCOL_SEARCH_DEBOUNCE_MS);
  const [results, setResults] = useState<ProtocolGlobalSearchResult>(EMPTY);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || debouncedQuery.trim().length < 2) {
      setResults(EMPTY);
      setIsSearching(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    setError(null);

    void searchProtocolGlobal(debouncedQuery, options)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResults(EMPTY);
          setError(err instanceof Error ? err.message : 'Search failed');
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, enabled, options?.atomsLimit, options?.triplesLimit]);

  return { results, isSearching, error, debouncedQuery };
}
