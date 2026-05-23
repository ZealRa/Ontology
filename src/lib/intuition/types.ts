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

export type SubmitClaimResult = {
  tripleTransactionHash: `0x${string}`;
  tripleTermId: `0x${string}`;
  subjectTermId: `0x${string}`;
  predicateTermId: `0x${string}`;
  objectTermId: `0x${string}`;
};
