import type { WriteConfig } from '@0xintuition/sdk';

import type { ClaimEntry } from '../../types';
import { submitOntologyClaimOnchain } from './submit-ontology-claim';
import type { ProtocolAtomResolution, SubmitClaimResult } from './types';

/**
 * Submit an ontology claim as a nested triple:
 * [predicate] — is best usage for — [slot triple termId]
 */
export async function submitClaimOnchain(
  config: WriteConfig,
  claim: Omit<ClaimEntry, 'id' | 'timestamp'>,
  _subjectResolution: ProtocolAtomResolution,
  predicateResolution: ProtocolAtomResolution,
  _objectResolution: ProtocolAtomResolution,
  onProgress?: (label: string) => void
): Promise<SubmitClaimResult> {
  if (!claim.predicateId) {
    throw new Error('Predicate is required for on-chain submission.');
  }

  return submitOntologyClaimOnchain(config, claim, predicateResolution, onProgress);
}
