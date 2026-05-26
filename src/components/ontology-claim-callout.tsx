import { Link } from 'react-router-dom';

import { formatOntologyPatternLine, ONTOLOGY_CLAIM_PATTERNS } from '../data/ontology-claim-patterns';

const exampleLine = formatOntologyPatternLine(ONTOLOGY_CLAIM_PATTERNS[0]!);

export function OntologyClaimCallout() {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-4 py-3 text-sm">
      <p className="text-[var(--color-text-secondary)] leading-relaxed">
        <span className="font-medium text-[var(--color-text)]">Ontology claims, not instances.</span>{' '}
        Propose reusable patterns for the graph — e.g.{' '}
        <span className="font-mono text-[var(--color-accent)]">{exampleLine}</span>
        — using <strong className="font-medium text-[var(--color-text)]">type names</strong> as atom
        labels, not arbitrary proper nouns.
      </p>
      <p className="mt-2">
        <Link
          to="/contributing"
          className="focus-ring text-[var(--color-accent)] font-medium hover:underline underline-offset-2"
        >
          How to contribute ontology claims →
        </Link>
      </p>
    </div>
  );
}
