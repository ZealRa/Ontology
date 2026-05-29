import { configureClient } from '@0xintuition/graphql';
import { useEffect, useMemo, useState } from 'react';

import { fetchOnchainOntologySlots, type OnchainOntologySlot } from './ontology-slots';

export function useOnchainOntologyMatrix(isEnabled: boolean, graphqlUrl: string) {
  const [slots, setSlots] = useState<OnchainOntologySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEnabled || !graphqlUrl) {
      setSlots([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    configureClient({ apiUrl: graphqlUrl });

    void fetchOnchainOntologySlots()
      .then((nextSlots) => {
        if (!cancelled) setSlots(nextSlots);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setSlots([]);
        setError(err instanceof Error ? err.message : 'Failed to load on-chain ontology');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEnabled, graphqlUrl]);

  return useMemo(
    () => ({
      slots,
      isLoading,
      error,
    }),
    [slots, isLoading, error]
  );
}
