/** On-chain atom choice for subject / object before triple submission. */
export type ProtocolAtomResolution =
  | {
      mode: 'existing';
      termId: `0x${string}`;
      label: string;
    }
  | {
      mode: 'create';
      label: string;
    };

export type AtomSuggestion = {
  termId: `0x${string}`;
  label: string;
};

/** Result of an ontology nested proposal (predicate — is best usage for — slot). */
export type SubmitClaimResult = {
  tripleTransactionHash: `0x${string}`;
  /** Meta triple term id: proposedPredicate — is best usage for — slot */
  tripleTermId: `0x${string}`;
  /** Slot triple term id: subjectType — ? — objectType */
  slotTermId: `0x${string}`;
  proposedPredicateTermId: `0x${string}`;
  metaPredicateTermId: `0x${string}`;
  /** Legacy fields for compatibility */
  subjectTermId: `0x${string}`;
  predicateTermId: `0x${string}`;
  objectTermId: `0x${string}`;
  subjectTypeId: string;
  objectTypeId: string;
  slotDisplayLine: string;
  proposedPredicateLabel: string;
};
