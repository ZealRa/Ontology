import type { WriteConfig } from '@0xintuition/sdk';

import type { ClaimEntry } from '../../types';
import {
  assertSufficientTrustBalance,
  estimateClaimOnchainCost,
  writeAtomFromLabel,
  writeTripleFromTermIds,
} from './protocol-write';
import type { ProtocolAtomResolution, SubmitClaimResult } from './types';

async function resolveAtom(
  config: WriteConfig,
  resolution: ProtocolAtomResolution,
  onProgress?: (label: string) => void
): Promise<`0x${string}`> {
  if (resolution.mode === 'existing') {
    return resolution.termId;
  }

  return writeAtomFromLabel(config, resolution.label, onProgress);
}

export async function submitClaimOnchain(
  config: WriteConfig,
  claim: Omit<ClaimEntry, 'id' | 'timestamp'>,
  subjectResolution: ProtocolAtomResolution,
  predicateResolution: ProtocolAtomResolution,
  objectResolution: ProtocolAtomResolution,
  onProgress?: (label: string) => void
): Promise<SubmitClaimResult> {
  if (!claim.predicateId) {
    throw new Error('Predicate is required for on-chain submission.');
  }
  if (!predicateResolution.label.trim()) {
    throw new Error('Predicate label is required for on-chain submission.');
  }

  onProgress?.('Checking TRUST balance…');
  const estimatedCost = await estimateClaimOnchainCost(
    config,
    subjectResolution,
    predicateResolution,
    objectResolution
  );
  await assertSufficientTrustBalance(config, estimatedCost);

  const subjectTermId = await resolveAtom(config, subjectResolution, onProgress);
  const predicateTermId = await resolveAtom(config, predicateResolution, onProgress);
  const objectTermId = await resolveAtom(config, objectResolution, onProgress);

  const { tripleTransactionHash, tripleTermId } = await writeTripleFromTermIds(
    config,
    subjectTermId,
    predicateTermId,
    objectTermId,
    onProgress
  );

  return {
    tripleTransactionHash,
    tripleTermId,
    subjectTermId,
    predicateTermId,
    objectTermId,
  };
}
