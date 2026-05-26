import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  formatOntologyPatternLine,
  ONTOLOGY_CLAIM_PATTERNS,
  ONTOLOGY_INSTANCE_ANTI_PATTERN,
  type OntologyClaimPattern,
} from '../data/ontology-claim-patterns';
import { useClaimWorkspace } from '../lib/use-claim-workspace';

export function ContributingOntologyPage() {
  const navigate = useNavigate();
  const { fillOntologyPattern } = useClaimWorkspace();

  const openInBuilder = useCallback(
    (pattern: OntologyClaimPattern) => {
      fillOntologyPattern(
        pattern.subjectTypeId,
        pattern.predicateId,
        pattern.objectTypeId
      );
      navigate('/');
    },
    [fillOntologyPattern, navigate]
  );

  return (
    <main className="px-4 sm:px-6 py-8 max-w-2xl mx-auto space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Ontology
        </p>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          Contributing ontology claims
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Intuition Ontology is a playground for the{' '}
          <strong className="font-medium text-[var(--color-text)]">proposed vocabulary</strong>:
          atom types, predicates, and which combinations are valid. On-chain, you register{' '}
          <strong className="font-medium text-[var(--color-text)]">patterns</strong> the ecosystem
          can reuse — not one-off facts about specific people or brands.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Patterns vs instances</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <PatternCard
            variant="good"
            title="Ontology claim (goal)"
            line={formatOntologyPatternLine(ONTOLOGY_CLAIM_PATTERNS[0]!)}
            body="Subject and object are type-level atoms (Person, Organization, DefinedTerm…). The triple documents the grammar."
          />
          <PatternCard
            variant="avoid"
            title={ONTOLOGY_INSTANCE_ANTI_PATTERN.title}
            line={ONTOLOGY_INSTANCE_ANTI_PATTERN.line}
            body={ONTOLOGY_INSTANCE_ANTI_PATTERN.detail}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Example patterns</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Use the type label as the on-chain atom name when creating or matching atoms. Pick
          existing atoms when the indexer already has them.
        </p>
        <ul className="space-y-2">
          {ONTOLOGY_CLAIM_PATTERNS.map((pattern) => (
            <li
              key={pattern.id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <p className="font-mono text-sm text-[var(--color-accent)]">
                {formatOntologyPatternLine(pattern)}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{pattern.summary}</p>
              <button
                type="button"
                onClick={() => openInBuilder(pattern)}
                className="focus-ring mt-3 rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                Open in Claim Builder
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Checklist</h2>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Subject / object labels match atom types (e.g. Person, not Marco).</li>
          <li>Predicate comes from the curated list and fits subject + object types.</li>
          <li>Prefer reusing existing on-chain atoms from suggestions.</li>
          <li>Explore the Matrix to see allowed type combinations before submitting.</li>
        </ul>
      </section>

      <p className="text-sm">
        <Link
          to="/"
          className="focus-ring text-[var(--color-accent)] font-medium hover:underline underline-offset-2"
        >
          ← Back to Explorer
        </Link>
        {' · '}
        <Link
          to="/matrix"
          className="focus-ring text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:underline underline-offset-2"
        >
          Entity matrix
        </Link>
      </p>
    </main>
  );
}

function PatternCard({
  variant,
  title,
  line,
  body,
}: {
  variant: 'good' | 'avoid';
  title: string;
  line: string;
  body: string;
}) {
  const border =
    variant === 'good' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5';
  const lineColor = variant === 'good' ? 'text-emerald-400' : 'text-amber-400/90';

  return (
    <div className={`rounded-lg border px-4 py-3 ${border}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {title}
      </p>
      <p className={`mt-1 font-mono text-sm ${lineColor}`}>{line}</p>
      <p className="mt-2 text-xs text-[var(--color-text-muted)] leading-relaxed">{body}</p>
    </div>
  );
}
