import { useState, useCallback, useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

import type { ProtocolAtomResolution } from '../lib/intuition/types';
import { useSubmitClaim } from '../lib/intuition/use-submit-claim';
import { useIntuitionNetwork } from '../lib/wallet/intuition-network-context';
import { SubjectInput } from './subject-input';
import { PredicateSelect } from './predicate-select';
import { ObjectInput } from './object-input';
import { ClaimPreview } from './claim-preview';
import { AtomSuggestions } from './atom-suggestions';
import { isSelfSubject } from '../lib/conjugate';
import {
  canResolveSubjectAtoms,
  isClaimStructurallyComplete,
  resolveObjectDisplayLabel,
  resolveSubjectDisplayLabel,
  shouldEnforceCuratedClaimTypeRules,
  soleObjectTypeForPredicate,
  subjectAtomSearchQuery,
} from '../lib/claim-readiness';
import {
  defaultPredicateAtomLabel,
  predicateSearchQuery,
} from '../lib/intuition/predicate-resolution';
import { getAtomTypeLabel } from '../data/ontology-claim-patterns';
import type { ExampleClaim } from '../data/example-claims';
import type { ClaimEntry } from '../types';

export interface ClaimBuilderHandle {
  fillFromMatrix: (subjectTypeId: string, predicateId: string, objectTypeId: string) => void;
  fillOntologyPattern: (subjectTypeId: string, predicateId: string, objectTypeId: string) => void;
  restoreClaim: (entry: ClaimEntry) => void;
  getSubjectValue: () => string;
  getSubjectType: () => string | null;
}

interface ClaimBuilderProps {
  onSubjectTypeChange?: (typeId: string | null) => void;
  onSubjectValueChange?: (value: string) => void;
  onPredicateChange?: (predicateId: string | null) => void;
  onSave?: (claim: Omit<ClaimEntry, 'id' | 'timestamp'>) => void;
  onAddToBatch?: (claim: Omit<ClaimEntry, 'id' | 'timestamp'>) => void;
}

function subjectAtomLabel(subject: string, subjectType: string | null): string {
  if (isSelfSubject(subjectType)) return 'I';
  return subject.trim();
}

export const ClaimBuilder = forwardRef<ClaimBuilderHandle, ClaimBuilderProps>(
  function ClaimBuilder(
    {
      onSubjectTypeChange,
      onSubjectValueChange,
      onPredicateChange,
      onSave,
      onAddToBatch,
    },
    ref
  ) {
    const [subject, setSubject] = useState('');
    const [subjectType, setSubjectType] = useState<string | null>(null);
    const [predicateId, setPredicateId] = useState<string | null>(null);
    const [object, setObject] = useState('');
    const [objectType, setObjectType] = useState<string | null>(null);
    const [subjectAtom, setSubjectAtom] = useState<ProtocolAtomResolution | null>(null);
    const [predicateAtom, setPredicateAtom] = useState<ProtocolAtomResolution | null>(null);
    const [objectAtom, setObjectAtom] = useState<ProtocolAtomResolution | null>(null);
    const [onchainSuccessMessage, setOnchainSuccessMessage] = useState<string | null>(null);

    const {
      submit,
      canSubmit,
      isSubmitting,
      progressLabel,
      error: onchainError,
      clearError,
      isWrongNetwork,
    } = useSubmitClaim();
    const { networkLabel, isStaticNetwork } = useIntuitionNetwork();
    const enforceCuratedTypeRules = shouldEnforceCuratedClaimTypeRules(isStaticNetwork);

    const subjectRef = useRef(subject);
    const subjectTypeRef = useRef(subjectType);
    useEffect(() => {
      subjectRef.current = subject;
      subjectTypeRef.current = subjectType;
    });

    useEffect(() => {
      setSubjectAtom((current) => {
        if (
          current?.mode === 'create' &&
          current.label === subjectAtomLabel(subject, subjectType)
        ) {
          return current;
        }
        return null;
      });
      clearError();
      setOnchainSuccessMessage(null);
    }, [subject, subjectType, clearError]);

    useEffect(() => {
      setPredicateAtom((current) => {
        if (
          current?.mode === 'create' &&
          predicateId &&
          current.label === defaultPredicateAtomLabel(predicateId, subjectType)
        ) {
          return current;
        }
        return null;
      });
      clearError();
      setOnchainSuccessMessage(null);
    }, [predicateId, subjectType, clearError]);

    useEffect(() => {
      setObjectAtom((current) => {
        if (current?.mode === 'create' && current.label === object.trim()) {
          return current;
        }
        return null;
      });
      clearError();
      setOnchainSuccessMessage(null);
    }, [object, clearError]);

    const hasSubject = canResolveSubjectAtoms(subject, subjectType);
    const hasPredicate = Boolean(predicateId?.trim());

    const claimFormState = {
      subject,
      subjectType,
      predicateId,
      object,
      objectType,
      subjectAtom,
    };

    useEffect(() => {
      const onlyType = soleObjectTypeForPredicate(predicateId, enforceCuratedTypeRules);
      if (onlyType && objectType !== onlyType) {
        setObjectType(onlyType);
      }
    }, [predicateId, objectType, enforceCuratedTypeRules]);

    const buildClaim = useCallback((): Omit<ClaimEntry, 'id' | 'timestamp'> | null => {
      if (
        !isClaimStructurallyComplete(claimFormState)
      ) {
        return null;
      }

      const predicateLabel =
        predicateAtom?.label ??
        defaultPredicateAtomLabel(predicateId!, subjectType);
      const storedSubject = isSelfSubject(subjectType)
        ? subject.trim() || 'I'
        : subject.trim();

      return {
        subject: storedSubject,
        subjectType: subjectType!,
        predicateId: predicateId!,
        predicateLabel,
        object: object.trim(),
        objectType: objectType!,
      };
    }, [subject, subjectType, predicateId, predicateAtom, object, objectType, subjectAtom]);

    useImperativeHandle(
      ref,
      () => ({
        fillFromMatrix(subTypeId: string, predId: string, objTypeId: string) {
          setSubjectType(subTypeId);
          onSubjectTypeChange?.(subTypeId);
          setPredicateId(predId);
          onPredicateChange?.(predId);
          setObjectType(objTypeId);
          setObject('');
          setSubjectAtom(null);
          setPredicateAtom(null);
          setObjectAtom(null);
        },
        fillOntologyPattern(subTypeId: string, predId: string, objTypeId: string) {
          const subjectLabel = getAtomTypeLabel(subTypeId);
          const objectLabel = getAtomTypeLabel(objTypeId);
          setSubject(subjectLabel);
          setSubjectType(subTypeId);
          onSubjectTypeChange?.(subTypeId);
          setPredicateId(predId);
          onPredicateChange?.(predId);
          setObject(objectLabel);
          setObjectType(objTypeId);
          setSubjectAtom(null);
          setPredicateAtom(null);
          setObjectAtom(null);
        },
        restoreClaim(entry: ClaimEntry) {
          setSubject(entry.subject);
          setSubjectType(entry.subjectType);
          onSubjectTypeChange?.(entry.subjectType);
          setPredicateId(entry.predicateId);
          onPredicateChange?.(entry.predicateId);
          setObject(entry.object);
          setObjectType(entry.objectType);
          setSubjectAtom(null);
          setPredicateAtom(null);
          setObjectAtom(null);
        },
        getSubjectValue: () => subjectRef.current,
        getSubjectType: () => subjectTypeRef.current,
      }),
      [onSubjectTypeChange, onPredicateChange]
    );

    const handleSubjectChange = useCallback((value: string) => {
      setSubject(value);
      onSubjectValueChange?.(value);
      if (!value.trim()) {
        setPredicateId(null);
        onPredicateChange?.(null);
        setObject('');
        setObjectType(null);
      }
    }, [onSubjectValueChange, onPredicateChange]);

    const handleSubjectTypeChange = useCallback((typeId: string | null) => {
      setSubjectType(typeId);
      setPredicateId(null);
      onPredicateChange?.(null);
      setObject('');
      setObjectType(null);
      onSubjectTypeChange?.(typeId);
    }, [onSubjectTypeChange, onPredicateChange]);

    const handlePredicateChange = useCallback((id: string | null) => {
      setPredicateId(id);
      setPredicateAtom(null);
      setObject('');
      setObjectType(null);
      onPredicateChange?.(id);
    }, [onPredicateChange]);

    const handleSave = useCallback(() => {
      const claim = buildClaim();
      if (claim) onSave?.(claim);
    }, [buildClaim, onSave]);

    const handleAddToBatch = useCallback(() => {
      const claim = buildClaim();
      if (claim) onAddToBatch?.(claim);
    }, [buildClaim, onAddToBatch]);

    const handleSubmitOnchain = useCallback(async () => {
      const claim = buildClaim();
      if (!claim) return;

      clearError();
      setOnchainSuccessMessage(null);

      const predicateResolution: ProtocolAtomResolution =
        predicateAtom ??
        {
          mode: 'create',
          label: defaultPredicateAtomLabel(predicateId!, subjectType),
        };

      const result = await submit(
        claim,
        { mode: 'create', label: '' },
        predicateResolution,
        { mode: 'create', label: '' },
        {
          subjectLabel: resolveSubjectDisplayLabel(subject, subjectType, subjectAtom),
          predicateLabel:
            predicateAtom?.label ??
            defaultPredicateAtomLabel(predicateId!, subjectType),
          objectLabel: resolveObjectDisplayLabel(object, objectAtom),
        }
      );
      if (result) {
        onSave?.(claim);
        const shortHash = `${result.tripleTransactionHash.slice(0, 10)}…`;
        setOnchainSuccessMessage(
          `Proposed « ${result.proposedPredicateLabel} » for ${result.slotDisplayLine} on Intuition (tx ${shortHash}).`
        );
      }
    }, [
      buildClaim,
      submit,
      subjectAtom,
      predicateAtom,
      objectAtom,
      subject,
      subjectType,
      predicateId,
      object,
      onSave,
      clearError,
    ]);

    const handleExampleClick = useCallback((example: ExampleClaim) => {
      setSubject(example.subject);
      setSubjectType(example.subjectType);
      onSubjectTypeChange?.(example.subjectType);
      setPredicateId(example.predicateId);
      onPredicateChange?.(example.predicateId);
      setObject(example.object);
      setObjectType(example.objectType);
      setSubjectAtom(null);
      setPredicateAtom(null);
      setObjectAtom(null);
    }, [onSubjectTypeChange, onPredicateChange]);

    const predicateLabel =
      predicateAtom?.label ??
      (predicateId ? defaultPredicateAtomLabel(predicateId, subjectType) : '');

    const subjectLabel = resolveSubjectDisplayLabel(subject, subjectType, subjectAtom);
    const objectLabel = resolveObjectDisplayLabel(object, objectAtom);

    const onchainHint = isWrongNetwork
      ? `Switch to ${networkLabel} to submit on-chain.`
      : !canSubmit && !isSubmitting
        ? 'Connect your wallet to submit on-chain.'
        : null;

    const hasContent =
      Boolean(subject.trim()) ||
      subjectType !== null ||
      predicateId !== null ||
      Boolean(object.trim()) ||
      objectType !== null ||
      subjectAtom !== null ||
      predicateAtom !== null ||
      objectAtom !== null;

    const handleClear = useCallback(() => {
      setSubject('');
      setSubjectType(null);
      setPredicateId(null);
      setObject('');
      setObjectType(null);
      setSubjectAtom(null);
      setPredicateAtom(null);
      setObjectAtom(null);
      setOnchainSuccessMessage(null);
      clearError();
      onSubjectTypeChange?.(null);
      onSubjectValueChange?.('');
      onPredicateChange?.(null);
    }, [clearError, onSubjectTypeChange, onSubjectValueChange, onPredicateChange]);

    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6" data-tutorial-step="claim-builder">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Ontology Proposal Builder
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Propose a predicate for a type slot. The submit path writes a nested proposal, not a flat instance claim.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasContent || isSubmitting}
            className="focus-ring h-8 shrink-0 rounded-md px-3 text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-raised)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Clear claim builder"
          >
            Clear
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <SubjectInput
              value={subject}
              onChange={handleSubjectChange}
              selectedType={subjectType}
              onTypeChange={handleSubjectTypeChange}
              onExampleClick={handleExampleClick}
            />
            <AtomSuggestions
              fieldLabel="subject"
              query={subjectAtomSearchQuery(subject, subjectType)}
              enabled={hasSubject}
              selection={subjectAtom}
              onSelectExisting={(suggestion) =>
                setSubjectAtom({
                  mode: 'existing',
                  termId: suggestion.termId,
                  label: suggestion.label,
                })
              }
              onChooseCreate={() =>
                setSubjectAtom({
                  mode: 'create',
                  label: subjectAtomLabel(subject, subjectType),
                })
              }
              onClearSelection={() => setSubjectAtom(null)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <PredicateSelect
              subjectType={subjectType}
              value={predicateId}
              onChange={handlePredicateChange}
              disabled={!hasSubject}
              enforceCuratedTypeRules={enforceCuratedTypeRules}
            />
            <AtomSuggestions
              fieldLabel="predicate"
              query={predicateId ? predicateSearchQuery(predicateId) : ''}
              enabled={hasPredicate}
              selection={predicateAtom}
              onSelectExisting={(suggestion) =>
                setPredicateAtom({
                  mode: 'existing',
                  termId: suggestion.termId,
                  label: suggestion.label,
                })
              }
              onChooseCreate={() =>
                setPredicateAtom({
                  mode: 'create',
                  label: defaultPredicateAtomLabel(predicateId!, subjectType),
                })
              }
              onClearSelection={() => setPredicateAtom(null)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <ObjectInput
              predicateId={predicateId}
              value={object}
              onChange={setObject}
              selectedType={objectType}
              onTypeChange={setObjectType}
              disabled={!hasPredicate}
              enforceCuratedTypeRules={enforceCuratedTypeRules}
            />
            <AtomSuggestions
              fieldLabel="object"
              query={object}
              enabled={hasPredicate && Boolean(object.trim())}
              selection={objectAtom}
              onSelectExisting={(suggestion) =>
                setObjectAtom({
                  mode: 'existing',
                  termId: suggestion.termId,
                  label: suggestion.label,
                })
              }
              onChooseCreate={() =>
                setObjectAtom({ mode: 'create', label: object.trim() })
              }
              onClearSelection={() => setObjectAtom(null)}
            />
          </div>
        </div>

        <div className="mt-6">
          <ClaimPreview
            {...claimFormState}
            subjectLabel={subjectLabel}
            predicateLabel={predicateLabel}
            objectLabel={objectLabel}
            subjectTermId={
              subjectAtom?.mode === 'existing' ? subjectAtom.termId : undefined
            }
            predicateTermId={
              predicateAtom?.mode === 'existing' ? predicateAtom.termId : undefined
            }
            objectTermId={
              objectAtom?.mode === 'existing' ? objectAtom.termId : undefined
            }
            onSave={onSave ? handleSave : undefined}
            onAddToBatch={onAddToBatch ? handleAddToBatch : undefined}
            onSubmitOnchain={handleSubmitOnchain}
            canSubmitOnchain={canSubmit}
            isSubmittingOnchain={isSubmitting}
            onchainProgressLabel={progressLabel}
            onchainError={onchainError ?? onchainHint}
            onchainSuccessMessage={onchainSuccessMessage}
            submitNetworkLabel={networkLabel}
            enforceCuratedTypeRules={enforceCuratedTypeRules}
          />
        </div>
      </div>
    );
  }
);
