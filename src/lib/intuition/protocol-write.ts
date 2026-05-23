import {
  createAtomFromString,
  createTripleStatement,
  multiVaultGetAtomCost,
  multiVaultGetGeneralConfig,
  multiVaultGetTripleCost,
  wait,
} from '@0xintuition/sdk';
import type { WriteConfig } from '@0xintuition/sdk';
import { formatEther } from 'viem';

import type { ProtocolAtomResolution } from './types';

/** GraphQL indexing poll — matches SDK example defaults. */
const INDEX_WAIT_OPTIONS = {
  pollingInterval: 1000,
  timeout: 30_000,
} as const;

type TripleCreatedState = Awaited<ReturnType<typeof createTripleStatement>>['state'];

function parseTripleTermId(state: TripleCreatedState): `0x${string}` | null {
  const first = state[0];
  const termId = first?.args?.termId;
  return termId ?? null;
}

/** Protocol fee + minimum vault deposit required per triple (see SDK sync helper). */
async function getTripleAssetsPerStatement(config: WriteConfig): Promise<bigint> {
  const [tripleCost, generalConfig] = await Promise.all([
    multiVaultGetTripleCost(config),
    multiVaultGetGeneralConfig(config),
  ]);
  return tripleCost + generalConfig.minDeposit;
}

/** Estimate TRUST required for a full claim (new atoms + triple statement). */
export async function estimateClaimOnchainCost(
  config: WriteConfig,
  subjectResolution: ProtocolAtomResolution,
  predicateResolution: ProtocolAtomResolution,
  objectResolution: ProtocolAtomResolution
): Promise<bigint> {
  const [atomCost, triplePayment] = await Promise.all([
    multiVaultGetAtomCost(config),
    getTripleAssetsPerStatement(config),
  ]);

  const resolutions = [subjectResolution, predicateResolution, objectResolution];
  const newAtoms = resolutions.filter((r) => r.mode === 'create').length;

  return atomCost * BigInt(newAtoms) + triplePayment;
}

export async function assertSufficientTrustBalance(
  config: WriteConfig,
  required: bigint
): Promise<void> {
  await assertWalletBalance(config, required);
}

async function assertWalletBalance(config: WriteConfig, required: bigint): Promise<void> {
  const account = config.walletClient.account;
  if (!account) {
    throw new Error('Wallet account is not available.');
  }

  const balance = await config.publicClient.getBalance({ address: account.address });
  if (balance < required) {
    throw new Error(
      `Insufficient TRUST balance. Need at least ${formatEther(required)} TRUST for this step (wallet has ${formatEther(balance)} TRUST).`
    );
  }
}

/**
 * Create an on-chain atom from a plain string label.
 * @see https://www.docs.intuition.systems/docs/intuition-sdk/examples/create-atom-from-string
 */
export async function writeAtomFromLabel(
  config: WriteConfig,
  label: string,
  onProgress?: (message: string) => void
): Promise<`0x${string}`> {
  const trimmed = label.trim();
  if (!trimmed) {
    throw new Error('Atom label cannot be empty.');
  }

  onProgress?.(`Creating atom «${trimmed}»…`);

  const atom = await createAtomFromString(config, trimmed as `${string}`);

  onProgress?.(`Indexing atom «${trimmed}»…`);
  await wait(atom.transactionHash, INDEX_WAIT_OPTIONS);

  return atom.state.termId;
}

/**
 * Link subject, predicate, and object atoms into a triple statement.
 * @see https://www.docs.intuition.systems/docs/intuition-sdk/examples/create-triple-statement
 */
export async function writeTripleFromTermIds(
  config: WriteConfig,
  subjectTermId: `0x${string}`,
  predicateTermId: `0x${string}`,
  objectTermId: `0x${string}`,
  onProgress?: (message: string) => void
): Promise<{
  tripleTransactionHash: `0x${string}`;
  tripleTermId: `0x${string}`;
}> {
  onProgress?.('Creating triple on Intuition…');

  const assetsPerTriple = await getTripleAssetsPerStatement(config);
  await assertWalletBalance(config, assetsPerTriple);

  const triple = await createTripleStatement(config, {
    args: [
      [subjectTermId],
      [predicateTermId],
      [objectTermId],
      [assetsPerTriple],
    ],
    value: assetsPerTriple,
  });

  const tripleTermId = parseTripleTermId(triple.state);
  if (!tripleTermId) {
    throw new Error('Triple created but term id was not found in the receipt.');
  }

  onProgress?.('Indexing triple on Intuition…');
  await wait(triple.transactionHash, INDEX_WAIT_OPTIONS);

  return {
    tripleTransactionHash: triple.transactionHash,
    tripleTermId,
  };
}
