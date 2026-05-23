import { useEffect, useState } from 'react';

import { ATOM_SEARCH_DEBOUNCE_MS } from '../timings';
import { useDebounce } from '../use-debounce';
import { searchProtocolAtoms } from './search-atoms';
import type { AtomSuggestion } from './types';

export function useAtomSuggestions(query: string, enabled: boolean) {
  const debouncedQuery = useDebounce(query, ATOM_SEARCH_DEBOUNCE_MS);
  const [suggestions, setSuggestions] = useState<AtomSuggestion[]>([]);
  const [broadened, setBroadened] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || debouncedQuery.trim().length < 1) {
      setSuggestions([]);
      setBroadened(false);
      setIsSearching(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    setError(null);

    void searchProtocolAtoms(debouncedQuery)
      .then((results) => {
        if (!cancelled) {
          setSuggestions(results.suggestions);
          setBroadened(results.broadened);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSuggestions([]);
          setBroadened(false);
          setError(err instanceof Error ? err.message : 'Search failed');
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, enabled]);

  return { suggestions, broadened, isSearching, error };
}
