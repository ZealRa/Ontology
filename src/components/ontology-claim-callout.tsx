import { Link } from 'react-router-dom';

export function OntologyClaimCallout() {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-4 py-3 text-sm">
      <p className="text-[var(--color-text-secondary)] leading-relaxed">
        <span className="font-medium text-[var(--color-text)]">Ontology claims, not instances.</span>{' '}
        Propose a predicate for an ontology slot — e.g. matrix row{' '}
        <span className="font-mono text-[var(--color-accent)]">Person — ? — Organisation</span>
        , submit{' '}
        <span className="font-mono text-[var(--color-accent)]">follows — is best usage for — slot</span>
        (never a flat instance triple). Use <strong className="font-medium text-[var(--color-text)]">type names</strong> as atom labels.
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
