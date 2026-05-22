import { useState, useCallback, useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

import type { ProtocolAtomResolution } from '../lib/intuition/types';
import { useSubmitClaim } from '../lib/intuition/use-submit-claim';
import { SubjectInput } from './subject-input';
import { PredicateSelect } from './predicate-select';
import { ObjectInput } from './object-input';
import { ClaimPreview } from './claim-preview';
import { AtomSuggestions } from './atom-suggestions';
import { isSelfSubject } from '../lib/conjugate';
import {
  defaultPredicateAtomLabel,
  predicateSearchQuery,
} from '../lib/intuition/predicate-resolution';
import type { ExampleClaim } from '../data/example-claims';
import type { ClaimEntry } from '../types';

export interface ClaimBuilderHandle {
  fillFromMatrix: (subjectTypeId: string, predicateId: string, objectTypeId: string) => void;
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

    const subjectRef = useRef(subject);
    const subjectTypeRef = useRef(subjectType);
    useEffect(() => {
      subjectRef.current = subject;
      subjectTypeRef.current = subjectType;
    });

    useEffect(() => {
      setSubjectAtom(null);
      clearError();
      setOnchainSuccessMessage(null);
    }, [subject, clearError]);

    useEffect(() => {
      setPredicateAtom(null);
      clearError();
      setOnchainSuccessMessage(null);
    }, [predicateId, subjectType, clearError]);

    useEffect(() => {
      setObjectAtom(null);
      clearError();
      setOnchainSuccessMessage(null);
    }, [object, clearError]);

    const hasSubject = subject.trim().length > 0 && subjectType !== null;
    const hasPredicate = predicateId !== null;

    const buildClaim = useCallback((): Omit<ClaimEntry, 'id' | 'timestamp'> | null => {
      if (!subject.trim() || !subjectType || !predicateId || !object.trim() || !objectType) return null;
      const predicateLabel =
        predicateAtom?.label ??
        defaultPredicateAtomLabel(predicateId, subjectType);
      return {
        subject,
        subjectType,
        predicateId,
        predicateLabel,
        object,
        objectType,
      };
    }, [subject, subjectType, predicateId, predicateAtom, object, objectType]);

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

      const subjectResolution: ProtocolAtomResolution =
        subjectAtom ?? { mode: 'create', label: subjectAtomLabel(subject, subjectType) };
      const predicateResolution: ProtocolAtomResolution =
        predicateAtom ??
        {
          mode: 'create',
          label: defaultPredicateAtomLabel(predicateId!, subjectType),
        };
      const objectResolution: ProtocolAtomResolution =
        objectAtom ?? { mode: 'create', label: object.trim() };

      const result = await submit(
        claim,
        subjectResolution,
        predicateResolution,
        objectResolution
      );
      if (result) {
        onSave?.(claim);
        const shortHash = `${result.tripleTransactionHash.slice(0, 10)}…`;
        setOnchainSuccessMessage(`Claim submitted on Intuition. Triple tx: ${shortHash}`);
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

    const subjectLabel =
      subjectAtom?.label ??
      (subject.trim() ? subjectAtomLabel(subject, subjectType) : '');
    const objectLabel = objectAtom?.label ?? object.trim();

    const onchainHint = isWrongNetwork
      ? 'Switch to Intuition Mainnet to submit on-chain.'
      : !canSubmit && !isSubmitting
        ? 'Connect your wallet to submit on-chain.'
        : null;

    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6" data-tutorial-step="claim-builder">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Claim Builder</h2>
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
              query={subject}
              enabled={hasSubject && canSubmit}
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
            />
            <AtomSuggestions
              fieldLabel="predicate"
              query={predicateId ? predicateSearchQuery(predicateId) : ''}
              enabled={hasPredicate && canSubmit}
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
            />
            <AtomSuggestions
              fieldLabel="object"
              query={object}
              enabled={hasPredicate && Boolean(object.trim()) && canSubmit}
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
            subjectLabel={subjectLabel}
            subjectType={subjectType}
            subjectTermId={
              subjectAtom?.mode === 'existing' ? subjectAtom.termId : undefined
            }
            predicateId={predicateId}
            predicateLabel={predicateLabel}
            predicateTermId={
              predicateAtom?.mode === 'existing' ? predicateAtom.termId : undefined
            }
            objectLabel={objectLabel}
            objectType={objectType}
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
          />
        </div>
      </div>
    );
  }
);
