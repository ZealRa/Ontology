import {
  createAtomFromString,
  createTripleStatement,
  multiVaultGetTripleCost,
} from '@0xintuition/sdk';
import type { WriteConfig } from '@0xintuition/protocol';

import type { ClaimEntry } from '../../types';
import type { ProtocolAtomResolution, SubmitClaimResult } from './types';

async function resolveAtom(
  config: WriteConfig,
  resolution: ProtocolAtomResolution,
  onProgress?: (label: string) => void
): Promise<`0x${string}`> {
  if (resolution.mode === 'existing') {
    return resolution.termId;
  }

  onProgress?.(`Creating atom «${resolution.label}»…`);
  const created = await createAtomFromString(
    config,
    resolution.label as `${string}`
  );
  return created.state.termId;
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

  const subjectTermId = await resolveAtom(config, subjectResolution, onProgress);
  const predicateTermId = await resolveAtom(config, predicateResolution, onProgress);
  const objectTermId = await resolveAtom(config, objectResolution, onProgress);

  onProgress?.('Creating triple on Intuition…');

  const tripleCost = await multiVaultGetTripleCost(config);

  const triple = await createTripleStatement(config, {
    args: [
      [subjectTermId],
      [predicateTermId],
      [objectTermId],
      [0n],
    ],
    value: tripleCost,
  });

  const firstEvent = triple.state[0];
  if (!firstEvent?.args?.termId) {
    throw new Error('Triple created but term id was not found in the receipt.');
  }

  return {
    tripleTransactionHash: triple.transactionHash,
    subjectTermId,
    predicateTermId,
    objectTermId,
  };
}
