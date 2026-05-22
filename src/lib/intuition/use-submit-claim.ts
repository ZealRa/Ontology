import { useCallback, useState } from 'react';

import type { ClaimEntry } from '../../types';
import { useIntuitionChain } from '../wallet/use-intuition-chain';
import { useWalletSession } from '../wallet/use-wallet-session';
import { submitClaimOnchain } from './submit-claim';
import type { ProtocolAtomResolution, SubmitClaimResult } from './types';
import { useIntuitionWriteConfig } from './use-intuition-write-config';

export function useSubmitClaim() {
  const writeConfig = useIntuitionWriteConfig();
  const { authenticated } = useWalletSession();
  const { isWrongNetwork } = useIntuitionChain();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(writeConfig && authenticated && !isWrongNetwork);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (
      claim: Omit<ClaimEntry, 'id' | 'timestamp'>,
      subjectResolution: ProtocolAtomResolution,
      predicateResolution: ProtocolAtomResolution,
      objectResolution: ProtocolAtomResolution
    ): Promise<SubmitClaimResult | null> => {
      if (!writeConfig) {
        setError('Connect your wallet on Intuition Mainnet to submit.');
        return null;
      }

      setIsSubmitting(true);
      setError(null);
      setProgressLabel('Preparing transaction…');

      try {
        const result = await submitClaimOnchain(
          writeConfig,
          claim,
          subjectResolution,
          predicateResolution,
          objectResolution,
          setProgressLabel
        );
        setProgressLabel(null);
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'On-chain submission failed';
        setError(message);
        setProgressLabel(null);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [writeConfig]
  );

  return {
    submit,
    canSubmit,
    isSubmitting,
    progressLabel,
    error,
    clearError,
    isWrongNetwork,
  };
}
