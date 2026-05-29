export type FormattedOnchainError = {
  title: string;
  description: string;
  hint?: string;
};

type ClaimErrorContext = {
  subjectLabel?: string;
  predicateLabel?: string;
  objectLabel?: string;
};

function collectErrorText(error: unknown): string {
  const parts: string[] = [];
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current != null && !seen.has(current)) {
    seen.add(current);

    if (typeof current === 'string') {
      parts.push(current);
    } else if (current instanceof Error) {
      parts.push(current.message);
      const shortMessage = (current as Error & { shortMessage?: string }).shortMessage;
      if (shortMessage) parts.push(shortMessage);
      const details = (current as Error & { details?: string }).details;
      if (typeof details === 'string') parts.push(details);
    } else if (typeof current === 'object') {
      const record = current as Record<string, unknown>;
      for (const key of ['message', 'shortMessage', 'details', 'reason']) {
        if (typeof record[key] === 'string') parts.push(record[key] as string);
      }
    }

    current =
      current instanceof Error
        ? current.cause
        : typeof current === 'object' && current !== null
          ? (current as { cause?: unknown }).cause
          : undefined;
  }

  return parts.join('\n');
}

function formatClaimTriple(subject: string, predicate: string, object: string): string {
  return `${subject} — ${predicate} — ${object}`;
}

function claimContextFromLabels(context?: ClaimErrorContext): string | null {
  const subject = context?.subjectLabel?.trim();
  const predicate = context?.predicateLabel?.trim();
  const object = context?.objectLabel?.trim();
  if (!subject || !predicate || !object) return null;
  return formatClaimTriple(subject, predicate, object);
}

/**
 * Maps raw wallet / contract errors to short, user-facing copy.
 */
export function formatOnchainError(
  error: unknown,
  context?: ClaimErrorContext
): FormattedOnchainError {
  const raw = collectErrorText(error);
  const claimLine = claimContextFromLabels(context);

  if (/MultiVault_TripleExists/i.test(raw) || /already proposed for slot/i.test(raw)) {
    const isOntologyMeta = /already proposed for slot/i.test(raw);
    return {
      title: isOntologyMeta ? 'This predicate is already proposed' : 'This claim already exists',
      description: isOntologyMeta
        ? raw.includes('«')
          ? raw.replace(/^[^:]+:\s*/i, '').trim()
          : 'This predicate was already proposed for this ontology slot on Intuition.'
        : claimLine
          ? `The triple « ${claimLine} » is already registered on Intuition. Creating it again is not allowed.`
          : 'This subject–predicate–object combination is already registered on Intuition.',
      hint: isOntologyMeta
        ? 'Open the matrix menu for this slot to see existing proposals, or pick a different predicate.'
        : 'Open Protocol search to find the existing triple, or stake on it instead of submitting a duplicate.',
    };
  }

  if (/MultiVault_AtomExists/i.test(raw)) {
    return {
      title: 'Atom already exists',
      description:
        'One of the atoms needed for this ontology proposal already exists on-chain. The app should reuse it instead of creating it again.',
      hint: 'Refresh the suggestions and choose the existing atom. If this keeps happening, wait a few seconds for the indexer and try again.',
    };
  }

  if (/user rejected|user denied|rejected the request|action_rejected|4001/i.test(raw)) {
    return {
      title: 'Transaction cancelled',
      description: 'You declined the transaction in your wallet. Nothing was submitted.',
    };
  }

  if (/insufficient funds|insufficient TRUST|InsufficientBalance/i.test(raw)) {
    return {
      title: 'Not enough TRUST',
      description:
        'Your wallet does not have enough TRUST to cover atom creation, the triple, and the minimum vault deposit.',
      hint: 'Add TRUST on the selected network (mainnet or testnet) and try again.',
    };
  }

  if (/timeout|timed out|indexing|wait.*transaction|transaction receipt/i.test(raw)) {
    return {
      title: 'Indexer is still catching up',
      description:
        'The transaction may have been sent, but the app could not confirm the indexed atom or triple yet.',
      hint: 'Wait a few seconds, then refresh the matrix or search by the transaction/term id before submitting again.',
    };
  }

  if (/MultiVault_InsufficientAssets|MultiVault_DepositBelowMinimumDeposit/i.test(raw)) {
    return {
      title: 'Deposit too low',
      description:
        'The amount sent does not meet the protocol minimum for this triple or vault deposit.',
      hint: 'Try again with a higher deposit if your flow allows it, or check network fees.',
    };
  }

  if (/network|chain|wrong network/i.test(raw)) {
    return {
      title: 'Wrong network',
      description: 'Your wallet is not on the Intuition network selected in the app.',
      hint: 'Use the network menu next to your wallet to switch to Intuition or Intuition Testnet.',
    };
  }

  return {
    title: 'On-chain submission failed',
    description:
      'The transaction could not be completed. Check your wallet, network, and TRUST balance, then try again.',
    hint: import.meta.env.DEV && raw
      ? 'Developer detail: see the browser console for the full revert message.'
      : undefined,
  };
}

export function isFormattedOnchainError(
  value: string | FormattedOnchainError | null | undefined
): value is FormattedOnchainError {
  return (
    value != null &&
    typeof value === 'object' &&
    'title' in value &&
    'description' in value
  );
}
