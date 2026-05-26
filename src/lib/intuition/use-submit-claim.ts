import { useCallback, useState } from 'react';

import type { ClaimEntry } from '../../types';
import { useIntuitionChain } from '../wallet/use-intuition-chain';
import { useWalletSession } from '../wallet/use-wallet-session';
import {
  formatOnchainError,
  type FormattedOnchainError,
} from './format-onchain-error';
export type { FormattedOnchainError } from './format-onchain-error';
import { submitClaimOnchain } from './submit-claim';
import type { ProtocolAtomResolution, SubmitClaimResult } from './types';
import { useIntuitionWriteConfig } from './use-intuition-write-config';

export function useSubmitClaim() {
  const writeConfig = useIntuitionWriteConfig();
  const { authenticated } = useWalletSession();
  const { isWrongNetwork } = useIntuitionChain();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [error, setError] = useState<FormattedOnchainError | null>(null);

  const canSubmit = Boolean(writeConfig && authenticated && !isWrongNetwork);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (
      claim: Omit<ClaimEntry, 'id' | 'timestamp'>,
      subjectResolution: ProtocolAtomResolution,
      predicateResolution: ProtocolAtomResolution,
      objectResolution: ProtocolAtomResolution,
      displayLabels?: {
        subjectLabel: string;
        predicateLabel: string;
        objectLabel: string;
      }
    ): Promise<SubmitClaimResult | null> => {
      if (!writeConfig) {
        setError({
          title: 'Wallet not ready',
          description: 'Connect your wallet on the selected Intuition network to submit.',
        });
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
        if (import.meta.env.DEV) {
          console.error('On-chain claim submission failed:', err);
        }
        setError(
          formatOnchainError(err, {
            subjectLabel: displayLabels?.subjectLabel ?? claim.subject,
            predicateLabel: displayLabels?.predicateLabel ?? claim.predicateLabel,
            objectLabel: displayLabels?.objectLabel ?? claim.object,
          })
        );
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
