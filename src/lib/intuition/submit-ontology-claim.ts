import type { WriteConfig } from '@0xintuition/sdk';

import { getAtomTypeLabel } from '../../data/ontology-claim-patterns';
import type { ClaimEntry } from '../../types';
import {
  ensureOntologySlotTriple,
  findAtomTermIdByLabel,
  findMetaProposalTriple,
  formatSlotDisplayLine,
  slotRefFromTypes,
} from './ontology-slots';
import { ONTOLOGY_META_PREDICATE_LABEL } from './ontology-vocabulary';
import {
  assertSufficientTrustBalance,
  estimateOntologyProposalCost,
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

/**
 * Ontology submit: only creates
 *   [proposedPredicate] — is best usage for — [slot triple termId]
 * Never creates a flat Person — follows — Organisation triple.
 */
export async function submitOntologyClaimOnchain(
  config: WriteConfig,
  claim: Omit<ClaimEntry, 'id' | 'timestamp'>,
  proposedPredicateResolution: ProtocolAtomResolution,
  onProgress?: (label: string) => void
): Promise<SubmitClaimResult> {
  if (!claim.subjectType || !claim.objectType) {
    throw new Error('Subject and object types are required for ontology claims.');
  }

  const proposedLabel = proposedPredicateResolution.label.trim();
  if (!proposedLabel) {
    throw new Error('Predicate label is required for on-chain submission.');
  }

  const slotRef = slotRefFromTypes(claim.subjectType, claim.objectType);

  onProgress?.('Checking TRUST balance…');
  const estimatedCost = await estimateOntologyProposalCost(
    config,
    proposedPredicateResolution,
    slotRef
  );
  await assertSufficientTrustBalance(config, estimatedCost);

  onProgress?.('Resolving ontology atoms…');
  const proposedPredicateTermId = await resolveAtom(
    config,
    proposedPredicateResolution,
    onProgress
  );

  let metaPredicateTermId = await findAtomTermIdByLabel(ONTOLOGY_META_PREDICATE_LABEL, 3);

  if (!metaPredicateTermId) {
    metaPredicateTermId = await writeAtomFromLabel(
      config,
      ONTOLOGY_META_PREDICATE_LABEL,
      onProgress
    );
  }

  const slotTermId = await ensureOntologySlotTriple(config, slotRef, onProgress);

  const existingMeta = await findMetaProposalTriple(slotTermId, proposedPredicateTermId);
  if (existingMeta) {
    throw new Error(
      `MultiVault_TripleExists: predicate « ${proposedLabel} » is already proposed for slot « ${formatSlotDisplayLine(slotRef)} ».`
    );
  }

  onProgress?.(
    `Proposing « ${proposedLabel} » for ${formatSlotDisplayLine(slotRef)}…`
  );

  const { tripleTransactionHash, tripleTermId } = await writeTripleFromTermIds(
    config,
    proposedPredicateTermId,
    metaPredicateTermId,
    slotTermId,
    onProgress
  );

  return {
    tripleTransactionHash,
    tripleTermId,
    slotTermId,
    proposedPredicateTermId,
    metaPredicateTermId,
    subjectTermId: proposedPredicateTermId,
    predicateTermId: metaPredicateTermId,
    objectTermId: slotTermId,
    subjectTypeId: claim.subjectType,
    objectTypeId: claim.objectType,
    slotDisplayLine: formatSlotDisplayLine(slotRef),
    proposedPredicateLabel: proposedLabel,
  };
}

/** Labels used for atom resolution when submitting from the builder. */
export function ontologySubmitLabels(
  claim: Pick<ClaimEntry, 'subject' | 'subjectType' | 'object' | 'objectType'>
): {
  subjectLabel: string;
  objectLabel: string;
} {
  return {
    subjectLabel: claim.subject.trim() || getAtomTypeLabel(claim.subjectType),
    objectLabel: claim.object.trim() || getAtomTypeLabel(claim.objectType),
  };
}
