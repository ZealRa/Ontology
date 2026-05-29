import { useMemo } from 'react';

import { getAllEntityMappings, type MatrixTypePair } from '../../data/semantic-rankings';
import { useIntuitionNetwork } from '../wallet/intuition-network-context';
import { useOnchainOntologyMatrix } from './use-onchain-ontology-matrix';

export function useMatrixTypePairs() {
  const { graphqlUrl, isStaticNetwork } = useIntuitionNetwork();
  const onchainMatrix = useOnchainOntologyMatrix(!isStaticNetwork, graphqlUrl);

  const pairs = useMemo((): MatrixTypePair[] => {
    if (isStaticNetwork) {
      return getAllEntityMappings().map((m) => ({
        subjectType: m.subjectType,
        objectType: m.objectType,
      }));
    }
    return onchainMatrix.slots.map((slot) => ({
      subjectType: slot.subjectTypeId,
      objectType: slot.objectTypeId,
    }));
  }, [isStaticNetwork, onchainMatrix.slots]);

  return {
    pairs,
    isLoading: !isStaticNetwork && onchainMatrix.isLoading,
    error: !isStaticNetwork ? onchainMatrix.error : null,
  };
}
